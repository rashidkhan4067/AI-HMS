from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
from datetime import timedelta
from departments.models import Department
from invitations.models import StaffInvite
from applications.models import DoctorApplication
from accounts.models import LoginAuditLog

User = get_user_model()

class AdminAPITests(APITestCase):
    def setUp(self):
        # Create or fetch departments (handles pre-existing data from migrations)
        self.cardiology, _ = Department.objects.get_or_create(name='Cardiology', defaults={'description': 'Heart services', 'code': 'CARD'})
        self.cardiology.code = 'CARD'
        self.cardiology.save(update_fields=['code'])

        self.pediatrics, _ = Department.objects.get_or_create(name='Pediatrics', defaults={'description': 'Kids services', 'code': 'PEDS'})
        self.pediatrics.code = 'PEDS'
        self.pediatrics.save(update_fields=['code'])

        # Create admin user
        self.admin_user = User.objects.create_user(
            email='admin@alshifaa.com',
            password='password123',
            full_name='Admin Owner',
            role='ADMIN',
            is_active=True
        )

        # Create doctor user
        self.doctor_user = User.objects.create_user(
            email='doctor@alshifaa.com',
            password='password123',
            full_name='Dr. Smith',
            role='DOCTOR',
            is_active=True
        )

        # URLs
        self.overview_url = reverse('admin_overview')
        self.audits_url = reverse('admin_audits')
        self.invites_list_url = reverse('admin_invite-list')
        self.applications_list_url = reverse('admin_application-list')
        self.users_list_url = reverse('admin_user-list')

    def test_admin_only_access_on_overview(self):
        # Unauthenticated request fails
        response = self.client.get(self.overview_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Non-admin request fails
        self.client.force_authenticate(user=self.doctor_user)
        response = self.client.get(self.overview_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Admin request succeeds
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.overview_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_active_staff', response.data)

    def test_overview_correct_metrics(self):
        # Add a pending application
        DoctorApplication.objects.create(
            full_name='Dr. Bob',
            email='bob@test.com',
            phone='+923001234567',
            dob='1990-01-01',
            gender='MALE',
            city='Lahore',
            specialization='Pediatrics',
            pmdc_number='12345-P',
            experience_years=5,
            status='PENDING'
        )

        # Add a failed audit log entry (security warning)
        LoginAuditLog.objects.create(
            email_attempted='fake@test.com',
            login_method='PASSWORD',
            success=False,
            failure_reason='Incorrect credentials'
        )

        # Add an active invite
        StaffInvite.objects.create(
            email='invite@test.com',
            role='NURSE',
            department=self.pediatrics,
            is_used=False
        )

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.overview_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_active_staff'], 1)  # self.doctor_user
        self.assertEqual(response.data['pending_applications'], 1)
        self.assertEqual(response.data['active_invite_tokens'], 1)
        self.assertEqual(response.data['security_warnings'], 1)

    def test_invite_creation_and_resend(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Create invite
        data = {
            'email': 'new.staff@alshifaa.com',
            'role': 'NURSE',
            'department': str(self.pediatrics.id)
        }
        response = self.client.post(self.invites_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        invite_id = response.data['id']

        # Verify in DB
        invite = StaffInvite.objects.get(id=invite_id)
        self.assertEqual(invite.email, 'new.staff@alshifaa.com')
        self.assertEqual(invite.role, 'NURSE')
        self.assertEqual(invite.department, self.pediatrics)
        self.assertFalse(invite.is_used)

        # Resend invite
        resend_url = reverse('admin_invite-resend-invite', kwargs={'pk': invite_id})
        response = self.client.post(resend_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invite_validation_checks(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Attempt to invite existing active user
        data = {
            'email': 'doctor@alshifaa.com',
            'role': 'DOCTOR',
            'department': str(self.cardiology.id)
        }
        response = self.client.post(self.invites_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_doctor_application_approval_flow(self):
        self.client.force_authenticate(user=self.admin_user)

        # Submit doctor application
        app = DoctorApplication.objects.create(
            full_name='Dr. Janet',
            email='janet@test.com',
            phone='+923007654321',
            dob='1985-05-12',
            gender='FEMALE',
            city='Islamabad',
            specialization='Cardiology',
            pmdc_number='54321-P',
            experience_years=10,
            status='PENDING'
        )

        approve_url = reverse('admin_application-approve-application', kwargs={'pk': app.id})
        response = self.client.post(approve_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify application status updated
        app.refresh_from_db()
        self.assertEqual(app.status, 'APPROVED')

        # Verify staff invitation generated automatically
        invite_exists = StaffInvite.objects.filter(email='janet@test.com').exists()
        self.assertTrue(invite_exists)
        invite = StaffInvite.objects.get(email='janet@test.com')
        self.assertEqual(invite.role, 'DOCTOR')
        self.assertEqual(invite.department, self.cardiology)  # specialization mapped to Cardiology!

    def test_user_toggle_active_status_and_lockout_prevention(self):
        self.client.force_authenticate(user=self.admin_user)

        # Toggle doctor active status (deactivate)
        doctor_toggle_url = reverse('admin_user-toggle-active', kwargs={'pk': self.doctor_user.id})
        response = self.client.post(doctor_toggle_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_active'])

        self.doctor_user.refresh_from_db()
        self.assertFalse(self.doctor_user.is_active)

        # Toggle self-deactivation fails (lockout guard)
        admin_toggle_url = reverse('admin_user-toggle-active', kwargs={'pk': self.admin_user.id})
        response = self.client.post(admin_toggle_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Self-deactivation is blocked', response.data['detail'])

        self.admin_user.refresh_from_db()
        self.assertTrue(self.admin_user.is_active)

    def test_unlock_user(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Lock user
        self.doctor_user.failed_attempts = 5
        self.doctor_user.locked_until = timezone.now() + timedelta(minutes=15)
        self.doctor_user.save()

        # Unlock user
        unlock_url = reverse('admin_user-unlock-user', kwargs={'pk': self.doctor_user.id})
        response = self.client.post(unlock_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.doctor_user.refresh_from_db()
        self.assertEqual(self.doctor_user.failed_attempts, 0)
        self.assertIsNone(self.doctor_user.locked_until)

    def test_system_health_check(self):
        self.client.force_authenticate(user=self.admin_user)
        health_url = reverse('admin_health_check')
        response = self.client.get(health_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('diagnostics', response.data)
        self.assertIn('message', response.data)

    # ── Department CRUD Tests ─────────────────────────────────────────────

    def test_list_departments(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin_department-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should have at least the departments created in setUp
        self.assertGreaterEqual(len(response.data), 2)
        # Each entry should have staff_count
        for dept in response.data:
            self.assertIn('staff_count', dept)

    def test_create_department(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin_department-list')
        response = self.client.post(url, {
            'name': 'Dermatology',
            'code': 'DERM',
            'description': 'Skin and dermal services',
            'location': 'Building C, Room 10',
            'contact_number': 'x1234',
            'is_active': True
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Dermatology')
        self.assertEqual(response.data['code'], 'DERM')
        self.assertEqual(response.data['location'], 'Building C, Room 10')
        self.assertEqual(response.data['contact_number'], 'x1234')
        self.assertTrue(Department.objects.filter(name='Dermatology').exists())

    def test_create_duplicate_department(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin_department-list')
        response = self.client.post(url, {
            'name': 'Cardiology',
            'code': 'CARD2',
            'description': 'Duplicate name should fail'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_duplicate_code(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin_department-list')
        response = self.client.post(url, {
            'name': 'Cardiology2',
            'code': 'CARD',
            'description': 'Duplicate code should fail'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_department(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin_department-detail', kwargs={'pk': self.pediatrics.id})
        response = self.client.patch(url, {
            'description': 'Updated pediatrics description',
            'is_active': False
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.pediatrics.refresh_from_db()
        self.assertEqual(self.pediatrics.description, 'Updated pediatrics description')
        self.assertFalse(self.pediatrics.is_active)

    def test_delete_empty_department(self):
        self.client.force_authenticate(user=self.admin_user)
        empty_dept = Department.objects.create(name='EmptyDept', code='EMPTY', description='To be deleted')
        url = reverse('admin_department-detail', kwargs={'pk': empty_dept.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Department.objects.filter(pk=empty_dept.id).exists())

    def test_delete_department_with_staff_blocked(self):
        self.client.force_authenticate(user=self.admin_user)
        # Assign doctor to cardiology
        self.doctor_user.department = self.cardiology
        self.doctor_user.save(update_fields=['department'])
        url = reverse('admin_department-detail', kwargs={'pk': self.cardiology.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cannot delete', response.data['detail'])
        # Verify department still exists
        self.assertTrue(Department.objects.filter(pk=self.cardiology.id).exists())

    def test_non_admin_cannot_access_departments(self):
        self.client.force_authenticate(user=self.doctor_user)
        url = reverse('admin_department-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


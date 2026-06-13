from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from invitations.models import StaffInvite
from applications.models import DoctorApplication
from departments.models import Department

User = get_user_model()

class OnboardingTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.validate_invite_url = reverse('validate_invite')
        self.register_url = reverse('register')
        self.apply_doctor_url = reverse('apply_doctor')
        
        self.dept, _ = Department.objects.get_or_create(
            name='Cardiology',
            defaults={'description': 'Heart health unit'}
        )
        
        self.valid_invite = StaffInvite.objects.create(
            email='invite.test@test.com',
            role='NURSE',
            department=self.dept,
            expires_at=timezone.now() + timedelta(days=2)
        )
        
        self.expired_invite = StaffInvite.objects.create(
            email='expired.test@test.com',
            role='DOCTOR',
            expires_at=timezone.now() - timedelta(days=1)
        )
        
        self.used_invite = StaffInvite.objects.create(
            email='used.test@test.com',
            role='RECEPTIONIST',
            is_used=True,
            expires_at=timezone.now() + timedelta(days=2)
        )

    def test_validate_invite_success(self):
        response = self.client.post(self.validate_invite_url, {'token': str(self.valid_invite.id)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['valid'])
        self.assertEqual(response.data['email'], 'invite.test@test.com')
        self.assertEqual(response.data['role'], 'NURSE')
        self.assertEqual(response.data['department_name'], 'Cardiology')

    def test_validate_invite_expired_fails(self):
        response = self.client.post(self.validate_invite_url, {'token': str(self.expired_invite.id)})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['valid'])

    def test_validate_invite_used_fails(self):
        response = self.client.post(self.validate_invite_url, {'token': str(self.used_invite.id)})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['valid'])

    def test_validate_invite_nonexistent_fails(self):
        response = self.client.post(self.validate_invite_url, {'token': '00000000-0000-0000-0000-000000000000'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['valid'])

    def test_register_with_valid_invite_token_succeeds(self):
        data = {
            'email': 'invite.test@test.com',
            'password': 'password12345',
            'full_name': 'Sarah Nurse',
            'role': 'DOCTOR',  # Will be overridden by the invite's NURSE role
            'invite_token': str(self.valid_invite.id)
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        user = User.objects.get(email='invite.test@test.com')
        self.assertEqual(user.role, 'NURSE')  # Overridden from DOCTOR to NURSE
        self.assertEqual(user.department, self.dept)
        self.assertTrue(user.is_active)  # Activated automatically
        
        self.valid_invite.refresh_from_db()
        self.assertTrue(self.valid_invite.is_used)

    def test_register_staff_directly_without_invite_fails(self):
        data = {
            'email': 'direct.staff@test.com',
            'password': 'password12345',
            'full_name': 'Direct Staff',
            'role': 'DOCTOR'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('role', response.data)

    def test_register_patient_directly_without_invite_succeeds(self):
        data = {
            'email': 'direct.patient@test.com',
            'password': 'password12345',
            'full_name': 'Direct Patient',
            'role': 'PATIENT'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        user = User.objects.get(email='direct.patient@test.com')
        self.assertEqual(user.role, 'PATIENT')
        self.assertTrue(user.is_active)

    def test_submit_doctor_application_success(self):
        cert_file = SimpleUploadedFile("cert.jpg", b"dummy_data_cert", content_type="image/jpeg")
        cnic_file = SimpleUploadedFile("cnic.pdf", b"dummy_data_cnic", content_type="application/pdf")
        
        data = {
            'full_name': 'Dr. Alan Smith',
            'email': 'alan.smith@test.com',
            'phone': '+923001234567',
            'dob': '1980-05-15',
            'gender': 'MALE',
            'city': 'Lahore',
            'specialization': 'Cardiology',
            'pmdc_number': 'PMDC-98765-D',
            'experience_years': 12,
            'current_hospital': 'Mayo Hospital',
            'pmdc_certificate': cert_file,
            'cnic_document': cnic_file
        }
        
        response = self.client.post(self.apply_doctor_url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(DoctorApplication.objects.filter(email='alan.smith@test.com').exists())

    def test_submit_doctor_application_invalid_file_type_fails(self):
        cert_file = SimpleUploadedFile("cert.png", b"dummy_data_cert", content_type="image/png")
        cnic_file = SimpleUploadedFile("cnic.pdf", b"dummy_data_cnic", content_type="application/pdf")
        
        data = {
            'full_name': 'Dr. Alan Smith',
            'email': 'alan.smith@test.com',
            'phone': '+923001234567',
            'dob': '1980-05-15',
            'gender': 'MALE',
            'city': 'Lahore',
            'specialization': 'Cardiology',
            'pmdc_number': 'PMDC-98765-D',
            'experience_years': 12,
            'pmdc_certificate': cert_file,
            'cnic_document': cnic_file
        }
        
        response = self.client.post(self.apply_doctor_url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('pmdc_certificate', response.data)

    def test_register_invited_success(self):
        url = reverse('register_invited')
        data = {
            'email': 'invite.test@test.com',
            'password': 'password12345',
            'full_name': 'Sarah Nurse',
            'invite_token': str(self.valid_invite.id)
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Account created successfully.')
        
        user = User.objects.get(email='invite.test@test.com')
        self.assertEqual(user.role, 'NURSE')
        self.assertEqual(user.department, self.dept)
        self.assertTrue(user.is_active)

    def test_register_invited_invalid_token_fails(self):
        url = reverse('register_invited')
        data = {
            'email': 'invite.test@test.com',
            'password': 'password12345',
            'full_name': 'Sarah Nurse',
            'invite_token': '00000000-0000-0000-0000-000000000000'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('invite_token', response.data)

    def test_register_patient_success(self):
        url = reverse('register_patient')
        data = {
            'email': 'newpatient@test.com',
            'password': 'password12345',
            'full_name': 'Ali Khan',
            'dob': '1995-10-20',
            'gender': 'MALE',
            'cnic': '35201-1234567-1',
            'phone': '+923001234567',
            'emergency_contact_name': 'Abid Khan',
            'emergency_contact_relationship': 'Father',
            'emergency_contact_phone': '+923007654321'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh_token', self.client.cookies)
        
        user = User.objects.get(email='newpatient@test.com')
        self.assertEqual(user.role, 'PATIENT')
        self.assertEqual(user.cnic, '35201-1234567-1')
        self.assertEqual(user.emergency_contact_relationship, 'Father')

    def test_register_patient_invalid_cnic_fails(self):
        url = reverse('register_patient')
        data = {
            'email': 'newpatient2@test.com',
            'password': 'password12345',
            'full_name': 'Ali Khan',
            'dob': '1995-10-20',
            'gender': 'MALE',
            'cnic': '35201-1234567',
            'phone': '+923001234567',
            'emergency_contact_name': 'Abid Khan',
            'emergency_contact_relationship': 'Father',
            'emergency_contact_phone': '+923007654321'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cnic', response.data)


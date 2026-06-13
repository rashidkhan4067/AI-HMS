from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
from datetime import date, time, timedelta
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment
from billing.models import Invoice
from pharmacy.models import PrescriptionDispense
from clinical.models import MedicalRecord
from departments.models import Department
from ipd.models import Ward, Bed, AdmissionRecord
from roster.models import DutyRoster

User = get_user_model()

class AdminEnhancementTests(APITestCase):
    def setUp(self):
        # 1. Create Department
        self.dept = Department.objects.create(name='Cardiology', description='Cardio clinic')

        # 2. Create Patient
        self.patient_user = User.objects.create_user(
            email='ipd_patient@test.com',
            password='password123',
            full_name='IPD Patient',
            role='PATIENT',
            is_active=True
        )
        self.patient = Patient.objects.get(user=self.patient_user)

        # 3. Create Doctor
        self.doctor_user = User.objects.create_user(
            email='ipd_doctor@test.com',
            password='password123',
            full_name='Dr. IPD Doctor',
            role='DOCTOR',
            is_active=True
        )
        self.doctor = Doctor.objects.get(user=self.doctor_user)
        self.doctor.pmdc_expiry_date = date.today() + timedelta(days=30)
        self.doctor.save()

        # 4. Create Admin User
        self.admin_user = User.objects.create_user(
            email='superadmin@test.com',
            password='password123',
            full_name='Super Admin',
            role='ADMIN',
            is_active=True
        )

        # 5. Create Staff User for Roster
        self.staff_user = User.objects.create_user(
            email='nurse_roster@test.com',
            password='password123',
            full_name='Roster Nurse',
            role='NURSE',
            is_active=True
        )

    def test_pmdc_compliance_api_success(self):
        """Ensure Admin can list doctors with PMDC expiry metadata."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin_pmdc_compliance')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['days_to_expiry'], 30)

    def test_revenue_reconciliation_api_success(self):
        """Ensure Admin can retrieve consolidated billing, pharmacy, and consult revenue."""
        # Create a paid invoice for consultation
        appt = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            date=date.today(),
            start_time=time(10, 0),
            end_time=time(10, 15),
            status='COMPLETED'
        )
        invoice = Invoice.objects.create(
            appointment=appt,
            patient=self.patient,
            amount=2000.00,
            paid_amount=2000.00,
            payment_status='PAID',
            payment_method='CASH'
        )

        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin_revenue_reconcile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify FBR 10% Withholding Tax calculations
        data = response.data
        self.assertEqual(data['doctor_consultations']['gross_amount'], 2000.00)
        self.assertEqual(data['doctor_consultations']['withholding_tax_deducted'], 200.00)
        self.assertEqual(data['doctor_consultations']['net_payout'], 1800.00)

    def test_billing_oversight_api_success(self):
        """Ensure Admin can retrieve billing oversight aggregates, overdue alerts, and ledger."""
        # Create an overdue invoice
        appt = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            date=date.today() - timedelta(days=5),
            start_time=time(10, 0),
            end_time=time(10, 15),
            status='COMPLETED'
        )
        # Outstanding invoice: amount 3000, paid 1000, insurance 1000, remaining 1000, due 3 days ago
        Invoice.objects.create(
            appointment=appt,
            patient=self.patient,
            amount=3000.00,
            paid_amount=1000.00,
            insurance_amount=1000.00,
            insurance_provider='SEHAT_CARD',
            due_date=date.today() - timedelta(days=3),
            payment_status='PARTIALLY_PAID',
            payment_method='MIXED'
        )

        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin_billing_oversight')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        self.assertEqual(data['aggregates']['total_collected'], 1000.00)
        self.assertEqual(data['aggregates']['patient_receivables'], 1000.00)
        self.assertEqual(data['aggregates']['insurance_receivables'], 1000.00)
        self.assertEqual(data['aggregates']['total_overdue'], 2000.00)
        self.assertEqual(data['aggregates']['overdue_count'], 1)
        self.assertEqual(len(data['overdue_alerts']), 1)
        self.assertEqual(data['overdue_alerts'][0]['days_overdue'], 3)

    def test_ipd_bed_admission_and_discharge_workflow(self):
        """Ensure admissions and discharges trigger appropriate bed state transitions."""
        ward = Ward.objects.create(name='Emergency Ward', category='GENERAL', daily_rate=1000.00)
        bed = Bed.objects.create(ward=ward, bed_number='E-101', status='AVAILABLE')

        self.client.force_authenticate(user=self.admin_user)
        
        # 1. Admit patient
        admission_url = reverse('admission-list')
        data = {
            'patient': str(self.patient.id),
            'bed': str(bed.id),
            'attending_doctor': str(self.doctor.id),
            'admission_reason': 'Fever observation'
        }
        response = self.client.post(admission_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Bed should be occupied
        bed.refresh_from_db()
        self.assertEqual(bed.status, 'OCCUPIED')

        # 2. Discharge patient
        record_id = response.data['id']
        discharge_url = reverse('admission-discharge-patient', kwargs={'pk': record_id})
        response = self.client.post(discharge_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Bed should transition to cleaning
        bed.refresh_from_db()
        self.assertEqual(bed.status, 'CLEANING')

    def test_duty_roster_scheduling_overlap_prevention(self):
        """Ensure Duty Roster blocks overlapping schedules for the same staff member."""
        self.client.force_authenticate(user=self.admin_user)
        roster_url = reverse('roster-list')

        # 1. Schedule initial shift
        start_time_1 = timezone.now() + timedelta(days=1)
        end_time_1 = start_time_1 + timedelta(hours=8)
        
        data_1 = {
            'staff_member': str(self.staff_user.id),
            'shift_start': start_time_1.isoformat(),
            'shift_end': end_time_1.isoformat(),
            'department': str(self.dept.id),
            'notes': 'Morning shift'
        }
        response = self.client.post(roster_url, data_1)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 2. Attempt overlapping shift (same staff member)
        start_time_2 = start_time_1 + timedelta(hours=4)  # Overlaps!
        end_time_2 = start_time_2 + timedelta(hours=8)

        data_2 = {
            'staff_member': str(self.staff_user.id),
            'shift_start': start_time_2.isoformat(),
            'shift_end': end_time_2.isoformat(),
            'department': str(self.dept.id),
            'notes': 'Overlapping afternoon shift'
        }
        response = self.client.post(roster_url, data_2)
        # Should fail with Validation Error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

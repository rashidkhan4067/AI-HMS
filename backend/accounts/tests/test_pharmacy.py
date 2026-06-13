from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
from datetime import date, time
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment
from clinical.models import MedicalRecord
from pharmacy.models import PrescriptionDispense
from billing.models import Invoice

User = get_user_model()

class PharmacyTests(APITestCase):
    def setUp(self):
        # Create Patient
        self.p1_user = User.objects.create_user(
            email='patient1@test.com',
            password='password123',
            full_name='Patient P1',
            role='PATIENT',
            is_active=True
        )
        self.patient1 = Patient.objects.get(user=self.p1_user)

        # Create Patient 2
        self.p2_user = User.objects.create_user(
            email='patient2@test.com',
            password='password123',
            full_name='Patient P2',
            role='PATIENT',
            is_active=True
        )
        self.patient2 = Patient.objects.get(user=self.p2_user)

        # Create Doctor
        self.d1_user = User.objects.create_user(
            email='doctor1@test.com',
            password='password123',
            full_name='Dr. Doctor One',
            role='DOCTOR',
            is_active=True
        )
        self.doctor1 = Doctor.objects.get(user=self.d1_user)

        # Create Pharmacist
        self.ph_user = User.objects.create_user(
            email='pharmacist@test.com',
            password='password123',
            full_name='Pharmacist One',
            role='PHARMACIST',
            is_active=True
        )

        # Create Receptionist
        self.recept_user = User.objects.create_user(
            email='recept@test.com',
            password='password123',
            full_name='Receptionist One',
            role='RECEPTIONIST',
            is_active=True
        )

        # Create Nurse
        self.nurse_user = User.objects.create_user(
            email='nurse@test.com',
            password='password123',
            full_name='Nurse One',
            role='NURSE',
            is_active=True
        )

        # Create Admin User
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='password123',
            full_name='Admin Owner',
            role='ADMIN',
            is_active=True
        )

        # Create Appointment
        self.appt = Appointment.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            date=date.today(),
            start_time=time(10, 0),
            end_time=time(10, 15),
            status='CONFIRMED'
        )

    def test_prescription_signal_creates_dispense(self):
        """Ensure a post-save signal on MedicalRecord with prescription text creates a PrescriptionDispense record."""
        # Create record with prescription
        record = MedicalRecord.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            appointment=self.appt,
            diagnosis='Cold',
            prescription='Paracetamol 500mg'
        )
        self.assertTrue(PrescriptionDispense.objects.filter(medical_record=record).exists())
        dispense = PrescriptionDispense.objects.get(medical_record=record)
        self.assertEqual(dispense.status, 'PENDING')
        self.assertEqual(dispense.amount, 0.00)

        # Create another appointment for patient 1 to test record without prescription
        appt2 = Appointment.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            date=date.today(),
            start_time=time(10, 30),
            end_time=time(10, 45),
            status='CONFIRMED'
        )

        # Create record without prescription (or empty/whitespace)
        record2 = MedicalRecord.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            appointment=appt2,
            diagnosis='Checkup',
            prescription=' '
        )
        self.assertFalse(PrescriptionDispense.objects.filter(medical_record=record2).exists())

    def test_dispense_authorization_permissions(self):
        """Only Pharmacists and Admins can update/patch a PrescriptionDispense."""
        record = MedicalRecord.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            appointment=self.appt,
            diagnosis='Cold',
            prescription='Aspirin'
        )
        dispense = PrescriptionDispense.objects.get(medical_record=record)
        detail_url = reverse('dispense-detail', args=[dispense.id])
        data = {'status': 'DISPENSED', 'amount': 15.50, 'notes': 'Dispensed 1 pack'}

        # Block Doctor
        self.client.force_authenticate(user=self.d1_user)
        response = self.client.patch(detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Block Patient
        self.client.force_authenticate(user=self.p1_user)
        response = self.client.patch(detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Block Receptionist
        self.client.force_authenticate(user=self.recept_user)
        response = self.client.patch(detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Block Nurse
        self.client.force_authenticate(user=self.nurse_user)
        response = self.client.patch(detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Allow Pharmacist
        self.client.force_authenticate(user=self.ph_user)
        response = self.client.patch(detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Allow Admin
        # Re-create a new appointment and dispense to avoid conflicts
        appt_admin = Appointment.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            date=date.today(),
            start_time=time(11, 0),
            end_time=time(11, 15),
            status='CONFIRMED'
        )
        record_admin = MedicalRecord.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            appointment=appt_admin,
            diagnosis='Cold',
            prescription='Ibuprofen'
        )
        dispense_admin = PrescriptionDispense.objects.get(medical_record=record_admin)
        detail_url_admin = reverse('dispense-detail', args=[dispense_admin.id])
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(detail_url_admin, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_dispensing_finalization_generates_invoice(self):
        """Finalizing a dispense with amount > 0 creates a PENDING Invoice for the Patient."""
        record = MedicalRecord.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            appointment=self.appt,
            diagnosis='Cold',
            prescription='Amlodipine'
        )
        dispense = PrescriptionDispense.objects.get(medical_record=record)
        detail_url = reverse('dispense-detail', args=[dispense.id])
        data = {'status': 'DISPENSED', 'amount': 45.00, 'notes': 'Take in morning'}

        self.client.force_authenticate(user=self.ph_user)
        response = self.client.patch(detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify dispense is updated
        dispense.refresh_from_db()
        self.assertEqual(dispense.status, 'DISPENSED')
        self.assertEqual(dispense.dispensed_by, self.ph_user)
        self.assertIsNotNone(dispense.dispensed_at)
        
        # Verify Invoice is created
        self.assertTrue(Invoice.objects.filter(patient=self.patient1, appointment=self.appt, amount=45.00).exists())
        invoice = Invoice.objects.get(patient=self.patient1, appointment=self.appt, amount=45.00)
        self.assertEqual(invoice.payment_status, 'PENDING')

    def test_dispensing_with_zero_amount_does_not_create_invoice(self):
        """Finalizing a dispense with amount <= 0 does not trigger Invoice creation."""
        record = MedicalRecord.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            appointment=self.appt,
            diagnosis='Cold',
            prescription='Free medicine'
        )
        dispense = PrescriptionDispense.objects.get(medical_record=record)
        detail_url = reverse('dispense-detail', args=[dispense.id])
        data = {'status': 'DISPENSED', 'amount': 0.00, 'notes': 'No charge'}

        self.client.force_authenticate(user=self.ph_user)
        response = self.client.patch(detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify Invoice is not created
        self.assertFalse(Invoice.objects.filter(patient=self.patient1, appointment=self.appt).exists())

    def test_patient_can_only_view_own_dispenses(self):
        """Ensure patients can retrieve only their own prescription dispense records."""
        record1 = MedicalRecord.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            appointment=self.appt,
            diagnosis='Cold',
            prescription='Loratadine'
        )
        dispense1 = PrescriptionDispense.objects.get(medical_record=record1)

        # Create appointment and record for Patient 2
        appt2 = Appointment.objects.create(
            patient=self.patient2,
            doctor=self.doctor1,
            date=date.today(),
            start_time=time(11, 30),
            end_time=time(11, 45),
            status='CONFIRMED'
        )
        record2 = MedicalRecord.objects.create(
            patient=self.patient2,
            doctor=self.doctor1,
            appointment=appt2,
            diagnosis='Allergy',
            prescription='Cetirizine'
        )
        dispense2 = PrescriptionDispense.objects.get(medical_record=record2)

        # Patient 1 fetches list: only sees self
        self.client.force_authenticate(user=self.p1_user)
        list_url = reverse('dispense-list')
        response = self.client.get(list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], str(dispense1.id))

        # Patient 1 detail fetches Patient 2 dispense: Not Found/Forbidden
        detail_url2 = reverse('dispense-detail', args=[dispense2.id])
        response = self.client.get(detail_url2)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

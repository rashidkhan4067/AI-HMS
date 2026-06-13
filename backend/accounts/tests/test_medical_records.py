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

User = get_user_model()

class MedicalRecordTests(APITestCase):
    def setUp(self):
        # 1. Create Patient 1
        self.p1_user = User.objects.create_user(
            email='patient1@test.com',
            password='password123',
            full_name='Patient P1',
            role='PATIENT',
            is_active=True
        )
        self.patient1 = Patient.objects.get(user=self.p1_user)

        # 2. Create Patient 2
        self.p2_user = User.objects.create_user(
            email='patient2@test.com',
            password='password123',
            full_name='Patient P2',
            role='PATIENT',
            is_active=True
        )
        self.patient2 = Patient.objects.get(user=self.p2_user)

        # 3. Create Doctor 1
        self.d1_user = User.objects.create_user(
            email='doctor1@test.com',
            password='password123',
            full_name='Dr. Doctor One',
            role='DOCTOR',
            is_active=True
        )
        self.doctor1 = Doctor.objects.get(user=self.d1_user)
        self.doctor1.specialization = 'Cardiology'
        self.doctor1.save()

        # 4. Create Doctor 2
        self.d2_user = User.objects.create_user(
            email='doctor2@test.com',
            password='password123',
            full_name='Dr. Doctor Two',
            role='DOCTOR',
            is_active=True
        )
        self.doctor2 = Doctor.objects.get(user=self.d2_user)
        self.doctor2.specialization = 'Pediatrics'
        self.doctor2.save()

        # 5. Create Admin User
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='password123',
            full_name='Admin Owner',
            role='ADMIN',
            is_active=True
        )

        # 6. Create Receptionist User
        self.recept_user = User.objects.create_user(
            email='recept@test.com',
            password='password123',
            full_name='Receptionist One',
            role='RECEPTIONIST',
            is_active=True
        )

        # 7. Create Appointment for patient1 with doctor1
        self.appt = Appointment.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            date=date.today(),
            start_time=time(10, 0),
            end_time=time(10, 15),
            status='CONFIRMED'
        )

        # URLs
        self.records_list_url = reverse('medical_record-list')

    def test_doctor_creates_medical_record_success(self):
        """Ensure Doctor can log a medical record encounter for an appointment."""
        self.client.force_authenticate(user=self.d1_user)
        data = {
            'patient': str(self.patient1.id),
            'appointment': str(self.appt.id),
            'diagnosis': 'Mild Hypertension. Advised less salt and regular monitoring.',
            'treatment_plan': 'Follow-up in 2 weeks.',
            'prescription': 'Lisinopril 10mg once daily.',
            'notes': 'Patient was compliant and co-operative.'
        }
        response = self.client.post(self.records_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MedicalRecord.objects.count(), 1)
        
        record = MedicalRecord.objects.first()
        self.assertEqual(record.doctor, self.doctor1)
        self.assertEqual(record.patient, self.patient1)
        self.assertEqual(record.diagnosis, data['diagnosis'])

    def test_non_doctor_cannot_create_record(self):
        """Patients, Admins, and Receptionists cannot create medical records."""
        # Patient attempt
        self.client.force_authenticate(user=self.p1_user)
        data = {'patient': str(self.patient1.id), 'diagnosis': 'Hypotension'}
        response = self.client.post(self.records_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Admin attempt
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.records_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Receptionist attempt
        self.client.force_authenticate(user=self.recept_user)
        response = self.client.post(self.records_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_patient_can_only_view_own_medical_records(self):
        """Ensure patient can list and retrieve their own records, but is blocked from others."""
        # Create record for Patient 1
        record1 = MedicalRecord.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            appointment=self.appt,
            diagnosis='Checkup 1'
        )

        # Patient 1 fetches: Success
        self.client.force_authenticate(user=self.p1_user)
        response = self.client.get(self.records_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], str(record1.id))

        # Retrieve detail: Success
        detail_url = reverse('medical_record-detail', args=[record1.id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Patient 2 fetches: Empty list (due to queryset filtering)
        self.client.force_authenticate(user=self.p2_user)
        response = self.client.get(self.records_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

        # Patient 2 tries to retrieve Patient 1's record detail directly: Forbidden/Not Found
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admins_and_receptionists_blocked_entirely(self):
        """Ensure system administrators and receptionists cannot list or retrieve records."""
        # Create record
        record = MedicalRecord.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            appointment=self.appt,
            diagnosis='Restricted clinical details'
        )

        detail_url = reverse('medical_record-detail', args=[record.id])

        # Admin attempts list
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.records_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Admin attempts retrieve
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Receptionist attempts list
        self.client.force_authenticate(user=self.recept_user)
        response = self.client.get(self.records_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_doctor_update_restricted_to_creator(self):
        """Doctors can view other records, but only edit/modify records they created."""
        # Create record by Doctor 1
        record1 = MedicalRecord.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            appointment=self.appt,
            diagnosis='Doctor 1 notes'
        )

        detail_url = reverse('medical_record-detail', args=[record1.id])

        # Doctor 2 reads: Success (clinical care staff read permission)
        self.client.force_authenticate(user=self.d2_user)
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Doctor 2 attempts edit: Forbidden
        data = {'diagnosis': 'Edited by Doctor 2'}
        response = self.client.patch(detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Doctor 1 attempts edit: Success
        self.client.force_authenticate(user=self.d1_user)
        response = self.client.patch(detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        record1.refresh_from_db()
        self.assertEqual(record1.diagnosis, 'Edited by Doctor 2')

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
from datetime import date, time
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment
from clinical.models import Vitals

User = get_user_model()


class TriageTests(APITestCase):
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

        # 4. Create Admin User
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='password123',
            full_name='Admin Owner',
            role='ADMIN',
            is_active=True
        )

        # 5. Create Nurse User
        self.nurse_user = User.objects.create_user(
            email='nurse@test.com',
            password='password123',
            full_name='Nurse One',
            role='NURSE',
            is_active=True
        )

        # 6. Create Confirmed Appointment for patient1 with doctor1
        self.appt1 = Appointment.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            date=date.today(),
            start_time=time(10, 0),
            end_time=time(10, 15),
            status='CONFIRMED'
        )

        # 7. Create Confirmed Appointment for patient2 with doctor1
        self.appt2 = Appointment.objects.create(
            patient=self.patient2,
            doctor=self.doctor1,
            date=date.today(),
            start_time=time(10, 30),
            end_time=time(10, 45),
            status='CONFIRMED'
        )

        # URLs
        self.vitals_list_url = reverse('vitals-list')

    def test_nurse_can_record_vitals(self):
        """Ensure Nurse can log triage vitals for a confirmed appointment."""
        self.client.force_authenticate(user=self.nurse_user)
        data = {
            'appointment': str(self.appt1.id),
            'patient': str(self.patient1.id),
            'blood_pressure': '120/80',
            'heart_rate': 72,
            'temperature': '98.6',
            'spo2': 98,
            'respiratory_rate': 16,
            'weight': '70.50',
            'height': '175.00'
        }
        response = self.client.post(self.vitals_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Vitals.objects.count(), 1)
        
        # Verify vitals values
        vitals = Vitals.objects.first()
        self.assertEqual(vitals.blood_pressure, '120/80')
        self.assertEqual(vitals.recorded_by, self.nurse_user)

        # Verify nesting in appointment payload
        appt_detail_url = reverse('appointment-detail', args=[self.appt1.id])
        response = self.client.get(appt_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data.get('vitals'))
        self.assertEqual(response.data['vitals']['blood_pressure'], '120/80')

    def test_admin_can_record_vitals(self):
        """Ensure Admin can record vitals."""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'appointment': str(self.appt1.id),
            'patient': str(self.patient1.id),
            'blood_pressure': '110/70',
            'heart_rate': 68,
            'temperature': '97.8',
            'spo2': 99
        }
        response = self.client.post(self.vitals_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_doctor_cannot_record_vitals(self):
        """Doctors are blocked from logging triage vitals."""
        self.client.force_authenticate(user=self.d1_user)
        data = {
            'appointment': str(self.appt1.id),
            'patient': str(self.patient1.id),
            'blood_pressure': '120/80',
            'heart_rate': 72,
            'temperature': '98.6',
            'spo2': 98
        }
        response = self.client.post(self.vitals_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_patient_cannot_record_vitals(self):
        """Patients cannot log vitals."""
        self.client.force_authenticate(user=self.p1_user)
        data = {
            'appointment': str(self.appt1.id),
            'patient': str(self.patient1.id),
            'blood_pressure': '120/80',
            'heart_rate': 72,
            'temperature': '98.6',
            'spo2': 98
        }
        response = self.client.post(self.vitals_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_patient_can_only_view_own_vitals(self):
        """Ensure patient can list and view their own vitals, but not other patients'."""
        v1 = Vitals.objects.create(
            appointment=self.appt1,
            patient=self.patient1,
            blood_pressure='120/80',
            heart_rate=72,
            temperature=98.6,
            spo2=98,
            recorded_by=self.nurse_user
        )
        v2 = Vitals.objects.create(
            appointment=self.appt2,
            patient=self.patient2,
            blood_pressure='130/90',
            heart_rate=80,
            temperature=99.1,
            spo2=96,
            recorded_by=self.nurse_user
        )

        # Patient 1 logs in
        self.client.force_authenticate(user=self.p1_user)
        
        # List: only shows v1
        response = self.client.get(self.vitals_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], str(v1.id))

        # Detail: v1 is allowed, v2 is blocked (404)
        detail_url1 = reverse('vitals-detail', args=[v1.id])
        response = self.client.get(detail_url1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        detail_url2 = reverse('vitals-detail', args=[v2.id])
        response = self.client.get(detail_url2)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

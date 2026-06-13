from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
from datetime import date, time
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import DoctorAvailability, Appointment

User = get_user_model()

class SchedulingTests(APITestCase):
    def setUp(self):
        # 1. Create Patient User
        self.patient_user = User.objects.create_user(
            email='patient.test@test.com',
            password='password123',
            full_name='Patient Alice',
            role='PATIENT',
            is_active=True
        )
        
        # 2. Create Doctor User
        self.doctor_user = User.objects.create_user(
            email='doctor.test@test.com',
            password='password123',
            full_name='Dr. Bob Smith',
            role='DOCTOR',
            is_active=True
        )

        # Retrieve automatically created profiles (created via signals)
        self.patient = Patient.objects.get(user=self.patient_user)
        self.doctor = Doctor.objects.get(user=self.doctor_user)
        self.doctor.specialization = 'Cardiology'
        self.doctor.save()

        # 3. Create Doctor Availability for Mondays (day_of_week=0), 09:00 to 12:00
        self.availability = DoctorAvailability.objects.create(
            doctor=self.doctor,
            day_of_week=0,
            start_time=time(9, 0),
            end_time=time(12, 0),
            slot_duration=15
        )

        self.list_appointments_url = reverse('appointment-list')
        self.book_appointment_url = reverse('appointment-list')

    def test_patient_mrn_generation(self):
        """Ensure MRN is generated sequentially and with the proper format."""
        self.assertIsNotNone(self.patient.mrn)
        self.assertTrue(self.patient.mrn.startswith(f"MRN-{timezone.now().year}-"))

        # Create another patient to test sequential logic
        p2_user = User.objects.create_user(
            email='patient2.test@test.com',
            password='password123',
            full_name='Patient Charlie',
            role='PATIENT',
            is_active=True
        )
        p2 = Patient.objects.get(user=p2_user)
        
        seq1 = int(self.patient.mrn.split('-')[-1])
        seq2 = int(p2.mrn.split('-')[-1])
        self.assertEqual(seq2, seq1 + 1)

    def test_appointment_booking_success(self):
        """Ensure booking within availability bounds works."""
        # Use a Monday: 2026-06-15 is a Monday
        app_date = date(2026, 6, 15)
        
        self.client.force_authenticate(user=self.patient_user)
        data = {
            'doctor': str(self.doctor.id),
            'date': str(app_date),
            'start_time': '09:30:00',
            'end_time': '09:45:00',
            'reason': 'Routine checkup'
        }
        response = self.client.post(self.book_appointment_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.count(), 1)
        
        appt = Appointment.objects.first()
        self.assertEqual(appt.patient, self.patient)
        self.assertEqual(appt.status, 'PENDING')

    def test_appointment_booking_outside_availability_fails(self):
        """Booking outside availability hours must fail."""
        app_date = date(2026, 6, 15) # Monday
        
        self.client.force_authenticate(user=self.patient_user)
        # Attempt booking before start time (e.g. 08:30)
        data = {
            'doctor': str(self.doctor.id),
            'date': str(app_date),
            'start_time': '08:30:00',
            'end_time': '08:45:00',
            'reason': 'Checkup'
        }
        response = self.client.post(self.book_appointment_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

        # Attempt booking on a Tuesday (day_of_week=1) when availability is on Monday
        tue_date = date(2026, 6, 16)
        data['date'] = str(tue_date)
        data['start_time'] = '10:00:00'
        data['end_time'] = '10:15:00'
        response = self.client.post(self.book_appointment_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_doctor_double_booking_fails(self):
        """Prevent double booking the same doctor in overlapping slots."""
        app_date = date(2026, 6, 15)
        
        # Book first slot: 09:30 to 10:00
        Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            date=app_date,
            start_time=time(9, 30),
            end_time=time(10, 0),
            status='CONFIRMED'
        )

        # Create another patient user to attempt booking overlapping slot
        p2_user = User.objects.create_user(
            email='p2@test.com',
            password='password123',
            full_name='Alice 2',
            role='PATIENT',
            is_active=True
        )
        p2 = Patient.objects.get(user=p2_user)

        self.client.force_authenticate(user=p2_user)
        
        # Overlapping case: 09:45 to 10:15
        data = {
            'doctor': str(self.doctor.id),
            'patient': str(p2.id),
            'date': str(app_date),
            'start_time': '09:45:00',
            'end_time': '10:15:00'
        }
        response = self.client.post(self.book_appointment_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("This doctor is already booked", response.data['non_field_errors'][0])

    def test_patient_double_booking_fails(self):
        """Prevent double booking the same patient in overlapping slots."""
        app_date = date(2026, 6, 15)
        
        # Book doctor 1 for this patient at 09:30 to 10:00
        Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            date=app_date,
            start_time=time(9, 30),
            end_time=time(10, 0),
            status='CONFIRMED'
        )

        # Create doctor 2 with availability
        d2_user = User.objects.create_user(
            email='d2@test.com',
            password='password123',
            full_name='Dr. Charles',
            role='DOCTOR',
            is_active=True
        )
        d2 = Doctor.objects.get(user=d2_user)
        d2.specialization = 'Cardiology'
        d2.save()
        
        DoctorAvailability.objects.create(
            doctor=d2,
            day_of_week=0,
            start_time=time(9, 0),
            end_time=time(12, 0)
        )

        self.client.force_authenticate(user=self.patient_user)
        
        # Attempt booking d2 in overlapping slot: 09:45 to 10:15
        data = {
            'doctor': str(d2.id),
            'date': str(app_date),
            'start_time': '09:45:00',
            'end_time': '10:15:00'
        }
        response = self.client.post(self.book_appointment_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("This patient is already booked", response.data['non_field_errors'][0])

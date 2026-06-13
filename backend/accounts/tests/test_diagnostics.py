from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
from datetime import date, time
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment
from clinical.models import DiagnosticOrder, DiagnosticResult

User = get_user_model()

class DiagnosticTests(APITestCase):
    def setUp(self):
        # 1. Create Patient
        self.patient_user = User.objects.create_user(
            email='patient@test.com',
            password='password123',
            full_name='Alice Smith',
            role='PATIENT',
            is_active=True
        )
        self.patient = Patient.objects.get(user=self.patient_user)

        # 2. Create Doctor
        self.doctor_user = User.objects.create_user(
            email='doctor@test.com',
            password='password123',
            full_name='Dr. Connor',
            role='DOCTOR',
            is_active=True
        )
        self.doctor = Doctor.objects.get(user=self.doctor_user)

        # 3. Create Lab Tech
        self.labtech_user = User.objects.create_user(
            email='labtech@test.com',
            password='password123',
            full_name='Lab Tech Robert',
            role='LAB_TECHNICIAN',
            is_active=True
        )

        # 4. Create Radiologist
        self.radiologist_user = User.objects.create_user(
            email='radiologist@test.com',
            password='password123',
            full_name='Marie Curie',
            role='RADIOLOGIST',
            is_active=True
        )

        # 5. Create Receptionist
        self.recept_user = User.objects.create_user(
            email='recept@test.com',
            password='password123',
            full_name='Receptionist Jane',
            role='RECEPTIONIST',
            is_active=True
        )

        # 6. Create Appointment
        self.appt = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            date=date.today(),
            start_time=time(10, 0),
            end_time=time(10, 15),
            status='CONFIRMED'
        )

        # URLs
        self.orders_list_url = reverse('diagnostic_order-list')

    def test_doctor_creates_lab_order_success(self):
        """Ensure doctor can order a lab diagnostic test."""
        self.client.force_authenticate(user=self.doctor_user)
        data = {
            'patient': str(self.patient.id),
            'appointment': str(self.appt.id),
            'test_name': 'Complete Blood Count (CBC)',
            'category': 'LAB',
            'notes': 'Check Hemoglobin levels.'
        }
        response = self.client.post(self.orders_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DiagnosticOrder.objects.count(), 1)
        order = DiagnosticOrder.objects.first()
        self.assertEqual(order.test_name, 'Complete Blood Count (CBC)')
        self.assertEqual(order.category, 'LAB')
        self.assertEqual(order.status, 'PENDING')

    def test_non_doctor_cannot_create_order(self):
        """Ensure other roles cannot order diagnostics."""
        self.client.force_authenticate(user=self.labtech_user)
        data = {
            'patient': str(self.patient.id),
            'appointment': str(self.appt.id),
            'test_name': 'Complete Blood Count (CBC)',
            'category': 'LAB'
        }
        response = self.client.post(self.orders_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_labtech_submits_lab_result_success(self):
        """Ensure Lab Tech can successfully submit result for LAB test."""
        # Pre-create a Lab Order
        order = DiagnosticOrder.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment=self.appt,
            test_name='Complete Blood Count (CBC)',
            category='LAB',
            status='PENDING'
        )

        self.client.force_authenticate(user=self.labtech_user)
        submit_url = reverse('diagnostic_order-submit-result', kwargs={'pk': order.id})
        data = {
            'result_summary': 'Normal CBC',
            'report_text': 'All metrics within reference ranges.',
            'attachment_url': '/reports/cbc_normal.pdf'
        }
        response = self.client.post(submit_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify status transitions
        order.refresh_from_db()
        self.assertEqual(order.status, 'COMPLETED')
        self.assertEqual(DiagnosticResult.objects.count(), 1)
        result = DiagnosticResult.objects.first()
        self.assertEqual(result.result_summary, 'Normal CBC')
        self.assertEqual(result.performed_by, self.labtech_user)

    def test_labtech_cannot_submit_radiology_result(self):
        """Ensure Lab Tech is forbidden from submitting RADIOLOGY results."""
        order = DiagnosticOrder.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment=self.appt,
            test_name='Chest X-Ray',
            category='RADIOLOGY',
            status='PENDING'
        )

        self.client.force_authenticate(user=self.labtech_user)
        submit_url = reverse('diagnostic_order-submit-result', kwargs={'pk': order.id})
        data = {
            'result_summary': 'Clear Lungs',
            'report_text': 'No abnormalities observed.'
        }
        response = self.client.post(submit_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_radiologist_submits_radiology_result_success(self):
        """Ensure Radiologist can successfully submit result for RADIOLOGY scan."""
        order = DiagnosticOrder.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment=self.appt,
            test_name='Chest X-Ray',
            category='RADIOLOGY',
            status='PENDING'
        )

        self.client.force_authenticate(user=self.radiologist_user)
        submit_url = reverse('diagnostic_order-submit-result', kwargs={'pk': order.id})
        data = {
            'result_summary': 'Clear Lungs',
            'report_text': 'No abnormalities observed.',
            'attachment_url': '/scans/cxr_clear.jpg'
        }
        response = self.client.post(submit_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        order.refresh_from_db()
        self.assertEqual(order.status, 'COMPLETED')
        self.assertEqual(DiagnosticResult.objects.count(), 1)

    def test_patient_can_view_own_diagnostics(self):
        """Ensure patient can list and view their own diagnostics."""
        DiagnosticOrder.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment=self.appt,
            test_name='CBC',
            category='LAB',
            status='PENDING'
        )

        self.client.force_authenticate(user=self.patient_user)
        response = self.client.get(self.orders_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
from datetime import date, time
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment
from billing.models import Invoice

User = get_user_model()


class BillingTests(APITestCase):
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
        self.doctor1.consultation_fee = 1500.00
        self.doctor1.save()

        # 4. Create Admin User
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='password123',
            full_name='Admin Owner',
            role='ADMIN',
            is_active=True
        )

        # 5. Create Receptionist User
        self.recept_user = User.objects.create_user(
            email='recept@test.com',
            password='password123',
            full_name='Receptionist One',
            role='RECEPTIONIST',
            is_active=True
        )

        # 6. Create Pending Appointment for patient1 with doctor1
        self.appt1 = Appointment.objects.create(
            patient=self.patient1,
            doctor=self.doctor1,
            date=date.today(),
            start_time=time(10, 0),
            end_time=time(10, 15),
            status='PENDING'
        )

        # 7. Create Pending Appointment for patient2 with doctor1
        self.appt2 = Appointment.objects.create(
            patient=self.patient2,
            doctor=self.doctor1,
            date=date.today(),
            start_time=time(10, 30),
            end_time=time(10, 45),
            status='PENDING'
        )

        # URL
        self.invoice_list_url = reverse('invoice-list')

    def test_receptionist_can_create_invoice_and_check_in(self):
        """Ensure Receptionist can create a paid invoice, confirming patient check-in."""
        self.client.force_authenticate(user=self.recept_user)
        data = {
            'appointment': str(self.appt1.id),
            'patient': str(self.patient1.id),
            'amount': '1500.00',
            'payment_method': 'CASH'
        }
        response = self.client.post(self.invoice_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Invoice.objects.count(), 1)
        
        # Verify invoice is PAID
        invoice = Invoice.objects.first()
        self.assertEqual(invoice.payment_status, 'PAID')
        self.assertEqual(invoice.payment_method, 'CASH')
        self.assertEqual(invoice.amount, 1500.00)
        
        # Verify appointment status transitioned to CONFIRMED
        self.appt1.refresh_from_db()
        self.assertEqual(self.appt1.status, 'CONFIRMED')

    def test_admin_can_create_invoice_and_check_in(self):
        """Ensure Admin can check in patient and generate invoice."""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'appointment': str(self.appt1.id),
            'patient': str(self.patient1.id),
            'amount': '1500.00',
            'payment_method': 'CARD'
        }
        response = self.client.post(self.invoice_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        self.appt1.refresh_from_db()
        self.assertEqual(self.appt1.status, 'CONFIRMED')

    def test_doctor_cannot_create_invoice(self):
        """Doctors are unauthorized to perform billing operations."""
        self.client.force_authenticate(user=self.d1_user)
        data = {
            'appointment': str(self.appt1.id),
            'patient': str(self.patient1.id),
            'amount': '1500.00',
            'payment_method': 'CASH'
        }
        response = self.client.post(self.invoice_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_patient_cannot_create_invoice(self):
        """Patients cannot create invoices."""
        self.client.force_authenticate(user=self.p1_user)
        data = {
            'appointment': str(self.appt1.id),
            'patient': str(self.patient1.id),
            'amount': '1500.00',
            'payment_method': 'CASH'
        }
        response = self.client.post(self.invoice_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_patient_can_only_view_own_invoices(self):
        """Ensure patient can retrieve their own invoices but not others."""
        # Create invoice for Patient 1
        inv1 = Invoice.objects.create(
            appointment=self.appt1,
            patient=self.patient1,
            amount=1500.00,
            payment_status='PAID',
            payment_method='CASH'
        )

        # Create invoice for Patient 2
        inv2 = Invoice.objects.create(
            appointment=self.appt2,
            patient=self.patient2,
            amount=1500.00,
            payment_status='PAID',
            payment_method='CARD'
        )

        # Patient 1 logs in
        self.client.force_authenticate(user=self.p1_user)
        
        # List invoices: should only return inv1
        response = self.client.get(self.invoice_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], str(inv1.id))

        # Retrieve inv1 details: Success
        detail_url1 = reverse('invoice-detail', args=[inv1.id])
        response = self.client.get(detail_url1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Retrieve inv2 details (Patient 2's invoice): NotFound/Forbidden
        detail_url2 = reverse('invoice-detail', args=[inv2.id])
        response = self.client.get(detail_url2)
        # Queryset filtering for patient blocks direct detail fetching of other patients' invoices
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_staff_can_view_all_invoices(self):
        """Receptionists and Admins can view all invoices."""
        inv1 = Invoice.objects.create(
            appointment=self.appt1,
            patient=self.patient1,
            amount=1500.00,
            payment_status='PAID',
            payment_method='CASH'
        )
        inv2 = Invoice.objects.create(
            appointment=self.appt2,
            patient=self.patient2,
            amount=1500.00,
            payment_status='PAID',
            payment_method='CARD'
        )

        # Receptionist logs in
        self.client.force_authenticate(user=self.recept_user)
        response = self.client.get(self.invoice_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIRequestFactory
from clinical.models import Vitals, MedicalRecord, DiagnosticOrder, DiagnosticResult
from clinical.serializers import (
    VitalsSerializer, MedicalRecordSerializer, 
    DiagnosticResultSerializer, DiagnosticOrderSerializer
)
from pharmacy.models import PrescriptionDispense
from pharmacy.serializers import PrescriptionDispenseSerializer
from appointments.models import Appointment
from appointments.serializers import AppointmentSerializer
from patients.models import Patient
from doctors.models import Doctor
from datetime import date, time

User = get_user_model()

class SerializerRedactionTests(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

        # Users
        self.patient_user = User.objects.create_user(
            email='patient@test.com',
            password='password123',
            full_name='Patient User',
            role='PATIENT',
            is_active=True
        )
        self.patient = Patient.objects.get(user=self.patient_user)

        self.doctor_user = User.objects.create_user(
            email='doctor@test.com',
            password='password123',
            full_name='Dr. Doctor',
            role='DOCTOR',
            is_active=True
        )
        self.doctor = Doctor.objects.get(user=self.doctor_user)

        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='password123',
            full_name='Admin User',
            role='ADMIN',
            is_active=True
        )

        self.recept_user = User.objects.create_user(
            email='recept@test.com',
            password='password123',
            full_name='Receptionist User',
            role='RECEPTIONIST',
            is_active=True
        )

        # Appointment
        self.appt = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            date=date.today(),
            start_time=time(10, 0),
            end_time=time(10, 15),
            status='CONFIRMED',
            reason='Chest discomfort and headache'
        )

        # Vitals
        self.vitals = Vitals.objects.create(
            appointment=self.appt,
            patient=self.patient,
            blood_pressure='130/85',
            heart_rate=80,
            temperature=98.6,
            spo2=99,
            respiratory_rate=16,
            weight=70.5,
            height=175.0,
            recorded_by=self.doctor_user
        )

        # Medical Record
        self.med_record = MedicalRecord.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment=self.appt,
            diagnosis='Stage 1 Hypertension',
            treatment_plan='Reduce sodium intake and follow-up in 2 weeks',
            prescription='Lisinopril 10mg once daily',
            notes='Patient has a family history of heart disease'
        )

        # Prescription Dispense (created automatically by signals)
        self.dispense = PrescriptionDispense.objects.get(medical_record=self.med_record)

        # Diagnostic Order
        self.diag_order = DiagnosticOrder.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment=self.appt,
            test_name='Lipid Profile',
            category='LAB',
            status='PENDING',
            notes='Check fasting cholesterol'
        )

        # Diagnostic Result
        self.diag_result = DiagnosticResult.objects.create(
            order=self.diag_order,
            performed_by=self.doctor_user,
            result_summary='Elevated LDL',
            report_text='LDL is 160 mg/dL, HDL is 40 mg/dL',
            attachment_url='http://example.com/reports/lipid.pdf'
        )

    def _get_request(self, user=None):
        request = self.factory.get('/')
        if user:
            request.user = user
        return request

    def test_vitals_serializer_redaction(self):
        # 1. Test Admin (Redacted)
        request = self._get_request(self.admin_user)
        serializer = VitalsSerializer(self.vitals, context={'request': request})
        data = serializer.data
        self.assertIsNone(data['blood_pressure'])
        self.assertIsNone(data['heart_rate'])
        self.assertIsNone(data['temperature'])
        self.assertIsNone(data['spo2'])

        # 2. Test Receptionist (Redacted)
        request = self._get_request(self.recept_user)
        serializer = VitalsSerializer(self.vitals, context={'request': request})
        data = serializer.data
        self.assertIsNone(data['blood_pressure'])
        self.assertIsNone(data['heart_rate'])

        # 3. Test Doctor (Not Redacted)
        request = self._get_request(self.doctor_user)
        serializer = VitalsSerializer(self.vitals, context={'request': request})
        data = serializer.data
        self.assertEqual(data['blood_pressure'], '130/85')
        self.assertEqual(data['heart_rate'], 80)

    def test_medical_record_serializer_redaction(self):
        # 1. Test Admin (Redacted)
        request = self._get_request(self.admin_user)
        serializer = MedicalRecordSerializer(self.med_record, context={'request': request})
        data = serializer.data
        self.assertEqual(data['diagnosis'], '[REDACTED]')
        self.assertEqual(data['treatment_plan'], '[REDACTED]')
        self.assertEqual(data['prescription'], '[REDACTED]')
        self.assertEqual(data['notes'], '[REDACTED]')

        # 2. Test Doctor (Not Redacted)
        request = self._get_request(self.doctor_user)
        serializer = MedicalRecordSerializer(self.med_record, context={'request': request})
        data = serializer.data
        self.assertEqual(data['diagnosis'], 'Stage 1 Hypertension')
        self.assertEqual(data['notes'], 'Patient has a family history of heart disease')

    def test_diagnostic_result_serializer_redaction(self):
        # 1. Test Admin (Redacted)
        request = self._get_request(self.admin_user)
        serializer = DiagnosticResultSerializer(self.diag_result, context={'request': request})
        data = serializer.data
        self.assertEqual(data['result_summary'], '[REDACTED]')
        self.assertEqual(data['report_text'], '[REDACTED]')
        self.assertIsNone(data['attachment_url'])

        # 2. Test Doctor (Not Redacted)
        request = self._get_request(self.doctor_user)
        serializer = DiagnosticResultSerializer(self.diag_result, context={'request': request})
        data = serializer.data
        self.assertEqual(data['result_summary'], 'Elevated LDL')
        self.assertEqual(data['attachment_url'], 'http://example.com/reports/lipid.pdf')

    def test_diagnostic_order_serializer_redaction(self):
        # 1. Test Admin (Redacted)
        request = self._get_request(self.admin_user)
        serializer = DiagnosticOrderSerializer(self.diag_order, context={'request': request})
        data = serializer.data
        self.assertEqual(data['notes'], '[REDACTED]')

        # 2. Test Doctor (Not Redacted)
        request = self._get_request(self.doctor_user)
        serializer = DiagnosticOrderSerializer(self.diag_order, context={'request': request})
        data = serializer.data
        self.assertEqual(data['notes'], 'Check fasting cholesterol')

    def test_prescription_dispense_serializer_redaction(self):
        # 1. Test Admin (Redacted)
        request = self._get_request(self.admin_user)
        serializer = PrescriptionDispenseSerializer(self.dispense, context={'request': request})
        data = serializer.data
        self.assertEqual(data['prescription_text'], '[REDACTED]')
        self.assertEqual(data['diagnosis'], '[REDACTED]')

        # 2. Test Doctor (Not Redacted)
        request = self._get_request(self.doctor_user)
        serializer = PrescriptionDispenseSerializer(self.dispense, context={'request': request})
        data = serializer.data
        self.assertEqual(data['prescription_text'], 'Lisinopril 10mg once daily')
        self.assertEqual(data['diagnosis'], 'Stage 1 Hypertension')

    def test_appointment_serializer_redaction(self):
        # 1. Test Admin (Redacted)
        request = self._get_request(self.admin_user)
        serializer = AppointmentSerializer(self.appt, context={'request': request})
        data = serializer.data
        self.assertEqual(data['reason'], '[REDACTED]')

        # 2. Test Receptionist (Not Redacted)
        request = self._get_request(self.recept_user)
        serializer = AppointmentSerializer(self.appt, context={'request': request})
        data = serializer.data
        self.assertEqual(data['reason'], 'Chest discomfort and headache')

        # 3. Test Doctor (Not Redacted)
        request = self._get_request(self.doctor_user)
        serializer = AppointmentSerializer(self.appt, context={'request': request})
        data = serializer.data
        self.assertEqual(data['reason'], 'Chest discomfort and headache')

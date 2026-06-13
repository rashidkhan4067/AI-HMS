from rest_framework import serializers
from clinical.models import Vitals, MedicalRecord, DiagnosticOrder, DiagnosticResult
from pharmacy.serializers import SimpleDispenseSerializer
from utils.rbac import is_administrative_role
import logging

logger = logging.getLogger(__name__)

class VitalsSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    patient_mrn = serializers.CharField(source='patient.mrn', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.full_name', read_only=True)

    class Meta:
        model = Vitals
        fields = (
            'id', 'appointment', 'patient', 'patient_name', 'patient_mrn',
            'blood_pressure', 'heart_rate', 'temperature', 'spo2',
            'respiratory_rate', 'weight', 'height', 'recorded_by', 'recorded_by_name',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'recorded_by', 'created_at', 'updated_at')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and is_administrative_role(request.user):
            clinical_fields = [
                'blood_pressure', 'heart_rate', 'temperature', 'spo2',
                'respiratory_rate', 'weight', 'height'
            ]
            for field in clinical_fields:
                data[field] = None
            logger.warning(
                f"User {request.user.email} with role {request.user.role} accessed "
                f"Vitals {instance.id} - clinical data redacted"
            )
        return data


class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    patient_mrn = serializers.CharField(source='patient.mrn', read_only=True)
    patient_cnic = serializers.CharField(source='patient.user.cnic', read_only=True)
    patient_dob = serializers.DateField(source='patient.user.dob', read_only=True)
    patient_gender = serializers.CharField(source='patient.user.gender', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.full_name', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    doctor_pmdc_number = serializers.CharField(source='doctor.user.employee_id', read_only=True)
    dispense = SimpleDispenseSerializer(read_only=True)

    class Meta:
        model = MedicalRecord
        fields = (
            'id', 'patient', 'patient_name', 'patient_mrn', 'patient_cnic', 'patient_dob', 'patient_gender',
            'doctor', 'doctor_name', 'doctor_specialization', 'doctor_pmdc_number',
            'appointment', 'diagnosis', 'treatment_plan',
            'prescription', 'notes', 'created_at', 'updated_at', 'dispense'
        )
        read_only_fields = ('id', 'doctor', 'created_at', 'updated_at')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and is_administrative_role(request.user):
            clinical_fields = ['diagnosis', 'treatment_plan', 'prescription', 'notes']
            for field in clinical_fields:
                data[field] = "[REDACTED]"
            logger.warning(
                f"User {request.user.email} with role {request.user.role} accessed "
                f"MedicalRecord {instance.id} - clinical data redacted"
            )
        return data


class DiagnosticResultSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.full_name', read_only=True)

    class Meta:
        model = DiagnosticResult
        fields = (
            'id', 'order', 'performed_by', 'performed_by_name',
            'result_summary', 'report_text', 'attachment_url',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'order', 'performed_by', 'created_at', 'updated_at')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and is_administrative_role(request.user):
            data['result_summary'] = "[REDACTED]"
            data['report_text'] = "[REDACTED]"
            data['attachment_url'] = None
            logger.warning(
                f"User {request.user.email} with role {request.user.role} accessed "
                f"DiagnosticResult {instance.id} - clinical data redacted"
            )
        return data


class DiagnosticOrderSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    patient_mrn = serializers.CharField(source='patient.mrn', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.full_name', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    result = DiagnosticResultSerializer(read_only=True)

    class Meta:
        model = DiagnosticOrder
        fields = (
            'id', 'patient', 'patient_name', 'patient_mrn',
            'doctor', 'doctor_name', 'doctor_specialization',
            'appointment', 'test_name', 'category', 'status',
            'notes', 'created_at', 'updated_at', 'result'
        )
        read_only_fields = ('id', 'doctor', 'created_at', 'updated_at')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and is_administrative_role(request.user):
            data['notes'] = "[REDACTED]"
            logger.warning(
                f"User {request.user.email} with role {request.user.role} accessed "
                f"DiagnosticOrder {instance.id} - clinical data redacted"
            )
        return data

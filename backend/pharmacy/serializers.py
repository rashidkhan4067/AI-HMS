from rest_framework import serializers
from pharmacy.models import PrescriptionDispense
from utils.rbac import is_administrative_role
import logging

logger = logging.getLogger(__name__)

class SimpleDispenseSerializer(serializers.ModelSerializer):
    dispensed_by_name = serializers.CharField(source='dispensed_by.full_name', read_only=True)

    class Meta:
        model = PrescriptionDispense
        fields = ('id', 'status', 'dispensed_by_name', 'dispensed_at', 'amount', 'notes')

class PrescriptionDispenseSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='medical_record.patient.user.full_name', read_only=True)
    patient_mrn = serializers.CharField(source='medical_record.patient.mrn', read_only=True)
    patient_id = serializers.UUIDField(source='medical_record.patient.id', read_only=True)
    doctor_name = serializers.CharField(source='medical_record.doctor.user.full_name', read_only=True)
    prescription_text = serializers.CharField(source='medical_record.prescription', read_only=True)
    diagnosis = serializers.CharField(source='medical_record.diagnosis', read_only=True)
    dispensed_by_name = serializers.CharField(source='dispensed_by.full_name', read_only=True)
    date_recorded = serializers.DateTimeField(source='medical_record.created_at', read_only=True)

    class Meta:
        model = PrescriptionDispense
        fields = (
            'id', 'medical_record', 'patient_id', 'patient_name', 'patient_mrn',
            'doctor_name', 'prescription_text', 'diagnosis', 'date_recorded',
            'status', 'dispensed_by', 'dispensed_by_name', 'dispensed_at',
            'amount', 'notes', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'medical_record', 'dispensed_by', 'dispensed_at', 'created_at', 'updated_at')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and is_administrative_role(request.user):
            data['prescription_text'] = "[REDACTED]"
            data['diagnosis'] = "[REDACTED]"
            logger.warning(
                f"User {request.user.email} with role {request.user.role} accessed "
                f"PrescriptionDispense {instance.id} - clinical data redacted"
            )
        return data

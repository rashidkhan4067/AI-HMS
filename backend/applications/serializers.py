from rest_framework import serializers
from applications.models import DoctorApplication

class DoctorApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorApplication
        fields = (
            'id', 'full_name', 'email', 'phone', 'dob', 'gender', 'city',
            'specialization', 'pmdc_number', 'experience_years', 'current_hospital',
            'pmdc_certificate', 'cnic_document', 'status', 'rejection_reason', 'created_at'
        )
        read_only_fields = ('id', 'status', 'rejection_reason', 'created_at')

    def validate_pmdc_certificate(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("PMDC certificate file size cannot exceed 5MB.")
        ext = value.name.split('.')[-1].lower()
        if ext not in ['pdf', 'jpg', 'jpeg']:
            raise serializers.ValidationError("Only PDF and JPG/JPEG files are accepted for PMDC certificate.")
        return value

    def validate_cnic_document(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("CNIC document file size cannot exceed 5MB.")
        ext = value.name.split('.')[-1].lower()
        if ext not in ['pdf', 'jpg', 'jpeg']:
            raise serializers.ValidationError("Only PDF and JPG/JPEG files are accepted for CNIC document.")
        return value

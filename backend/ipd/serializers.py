from rest_framework import serializers
from ipd.models import Ward, Bed, AdmissionRecord

class BedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bed
        fields = '__all__'

class WardSerializer(serializers.ModelSerializer):
    total_beds = serializers.IntegerField(source='beds.count', read_only=True)
    available_beds = serializers.SerializerMethodField()

    class Meta:
        model = Ward
        fields = ('id', 'name', 'category', 'department', 'daily_rate', 'total_beds', 'available_beds')

    def get_available_beds(self, obj):
        return obj.beds.filter(status='AVAILABLE').count()

class AdmissionRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    bed_number = serializers.CharField(source='bed.bed_number', read_only=True)
    ward_name = serializers.CharField(source='bed.ward.name', read_only=True)
    doctor_name = serializers.CharField(source='attending_doctor.user.full_name', read_only=True)

    class Meta:
        model = AdmissionRecord
        fields = (
            'id', 'patient', 'patient_name', 'bed', 'bed_number', 'ward_name',
            'attending_doctor', 'doctor_name', 'admitted_at', 'discharged_at',
            'admission_reason', 'status'
        )
        read_only_fields = ('id', 'admitted_at', 'discharged_at', 'status')

    def validate_bed(self, value):
        if value.status != 'AVAILABLE':
            raise serializers.ValidationError("This bed is not currently available for admission.")
        return value

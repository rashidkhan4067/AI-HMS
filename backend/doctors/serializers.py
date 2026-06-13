from rest_framework import serializers
from django.contrib.auth import get_user_model
from doctors.models import Doctor
from accounts.serializers import UserSerializer

User = get_user_model()

class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='DOCTOR'),
        source='user',
        write_only=True
    )

    class Meta:
        model = Doctor
        fields = ('id', 'user', 'user_id', 'specialization', 'consultation_fee', 'bio', 'is_available', 'pmdc_expiry_date', 'license_status')
        read_only_fields = ('id', 'user')

    def create(self, validated_data):
        user = validated_data.get('user')
        doctor, created = Doctor.objects.get_or_create(user=user, defaults=validated_data)
        if not created:
            for attr, value in validated_data.items():
                setattr(doctor, attr, value)
            doctor.save()
        return doctor

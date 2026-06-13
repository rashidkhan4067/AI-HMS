import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from patients.models import Patient
from accounts.serializers import UserSerializer

User = get_user_model()

class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Patient
        fields = ('id', 'user', 'mrn')
        read_only_fields = ('id', 'user', 'mrn')

class RegisterPatientSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    full_name = serializers.CharField(required=True)
    dob = serializers.DateField(required=True)
    gender = serializers.CharField(required=True)
    cnic = serializers.CharField(required=True)
    phone = serializers.CharField(required=True)
    emergency_contact_name = serializers.CharField(required=True)
    emergency_contact_relationship = serializers.CharField(required=True)
    emergency_contact_phone = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = (
            'email', 'password', 'full_name', 'dob', 'gender', 'cnic',
            'phone', 'emergency_contact_name', 'emergency_contact_relationship',
            'emergency_contact_phone'
        )

    def validate_cnic(self, value):
        if not re.match(r'^\d{5}-\d{7}-\d{1}$', value):
            raise serializers.ValidationError("CNIC must be in the format XXXXX-XXXXXXX-X")
        return value

    def validate_gender(self, value):
        val = value.upper().strip()
        if val not in ['MALE', 'FEMALE', 'OTHER']:
            raise serializers.ValidationError("Gender must be one of Male, Female, Other.")
        return val

    def validate_emergency_contact_relationship(self, value):
        val = value.title().strip()
        if val not in ['Father', 'Mother', 'Spouse', 'Sibling', 'Child', 'Other']:
            raise serializers.ValidationError("Relationship must be one of Father, Mother, Spouse, Sibling, Child, Other.")
        return val

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            role=User.Role.PATIENT,
            is_active=True,
            dob=validated_data.get('dob'),
            gender=validated_data.get('gender'),
            cnic=validated_data.get('cnic'),
            phone=validated_data.get('phone'),
            emergency_contact_name=validated_data.get('emergency_contact_name'),
            emergency_contact_relationship=validated_data.get('emergency_contact_relationship'),
            emergency_contact_phone=validated_data.get('emergency_contact_phone')
        )
        try:
            from accounts.utils import send_welcome_email
            send_welcome_email(user)
        except Exception:
            pass
        return user

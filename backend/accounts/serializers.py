import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone
from accounts.models import PasswordResetOTP, LoginAuditLog
from departments.models import Department
from invitations.models import StaffInvite

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    department_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'full_name', 'role', 'department', 'department_name',
            'employee_id', 'phone', 'is_active', 'must_complete_profile', 'created_at',
            'locked_until', 'failed_attempts',
        )
        read_only_fields = ('id', 'is_active', 'created_at', 'must_complete_profile', 'locked_until', 'failed_attempts')

    def get_department_name(self, obj):
        if not obj.department_id:
            return None
        try:
            return obj.department.name
        except Exception:
            return None

class CompleteProfileSerializer(serializers.Serializer):
    department = serializers.UUIDField(required=True)
    employee_id = serializers.CharField(max_length=50, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate_department(self, value):
        try:
            dept = Department.objects.get(id=value)
        except Department.DoesNotExist:
            raise serializers.ValidationError('Invalid department selected.')
        return dept

    def validate_employee_id(self, value):
        if not value:
            return value
        request = self.context.get('request')
        qs = User.objects.filter(employee_id=value)
        if request and request.user:
            qs = qs.exclude(pk=request.user.pk)
        if qs.exists():
            raise serializers.ValidationError('This Employee ID is already in use.')
        return value

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    full_name = serializers.CharField(required=False, allow_blank=True)
    invite_token = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'full_name', 'role', 'first_name', 'last_name', 'invite_token')

    def validate_role(self, value):
        valid_roles = [
            User.Role.ADMIN, User.Role.DOCTOR, User.Role.NURSE,
            User.Role.RECEPTIONIST, User.Role.PHARMACIST,
            User.Role.LAB_TECHNICIAN, User.Role.RADIOLOGIST,
            User.Role.PATIENT
        ]
        if value not in valid_roles:
            raise serializers.ValidationError("Invalid user role.")
        return value

    def validate(self, attrs):
        invite_token = attrs.get('invite_token', '')
        role = attrs.get('role', 'DOCTOR')
        email = attrs.get('email', '').lower().strip()

        if invite_token:
            try:
                invite = StaffInvite.objects.get(id=invite_token)
            except (StaffInvite.DoesNotExist, ValueError):
                raise serializers.ValidationError({"invite_token": "Invalid or expired invitation token."})

            if not invite.is_valid():
                raise serializers.ValidationError({"invite_token": "This invitation has expired or has already been used."})

            if invite.email.lower().strip() != email:
                raise serializers.ValidationError({"email": "This email does not match the invitation email."})

            # Force the role and department to match the invitation (Zero-Trust)
            attrs['role'] = invite.role
            attrs['department'] = invite.department
            self.context['invite'] = invite
        else:
            # Direct registration only allowed for patients
            if role != User.Role.PATIENT:
                raise serializers.ValidationError({"role": "Staff registration requires a valid invitation token."})

        first_name = attrs.get('first_name', '')
        last_name = attrs.get('last_name', '')
        full_name = attrs.get('full_name', '')

        if not full_name:
            if first_name or last_name:
                attrs['full_name'] = f"{first_name} {last_name}".strip()
            else:
                raise serializers.ValidationError({"full_name": "Full name is required."})

        # Remove temporary fields before creating user
        attrs.pop('first_name', None)
        attrs.pop('last_name', None)
        return attrs

    def create(self, validated_data):
        validated_data.pop('invite_token', None)
        invite = self.context.get('invite', None)
        
        role = validated_data.get('role', User.Role.PATIENT)
        department = validated_data.get('department', None)

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            role=role,
            department=department,
            is_active=True
        )

        if invite:
            invite.is_used = True
            invite.save(update_fields=['is_used'])

        try:
            from accounts.utils import send_welcome_email
            send_welcome_email(user)
        except Exception:
            pass
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims (e.g. role) to the JWT payload
        token['role'] = user.role
        token['email'] = user.email
        token['full_name'] = user.full_name
        token['must_complete_profile'] = user.must_complete_profile

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['email'] = self.user.email
        data['must_complete_profile'] = self.user.must_complete_profile
        return data

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)
    
    def validate_new_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "New passwords do not match."})
        return data

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower().strip()

class VerifyOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp   = serializers.CharField(min_length=6, max_length=6)

    def validate(self, data):
        email = data['email'].lower().strip()
        otp   = data['otp'].strip()

        try:
            record = PasswordResetOTP.objects.filter(email=email, is_used=False).latest('created_at')
        except PasswordResetOTP.DoesNotExist:
            raise serializers.ValidationError({'otp': 'No active reset code found for this email.'})

        if not record.is_valid():
            raise serializers.ValidationError({'otp': 'This verification code has expired. Please request a new one.'})

        if record.otp != otp:
            raise serializers.ValidationError({'otp': 'Invalid verification code. Please try again.'})

        # Attach the record to the validated data for use in the view
        data['otp_record'] = record
        return data

class ResetPasswordSerializer(serializers.Serializer):
    otp_record_id   = serializers.IntegerField()
    password        = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})

        try:
            record = PasswordResetOTP.objects.get(pk=data['otp_record_id'], is_used=True)
        except PasswordResetOTP.DoesNotExist:
            raise serializers.ValidationError({'otp_record_id': 'Invalid or expired reset session. Please start over.'})

        try:
            data['user'] = User.objects.get(email=record.email)
        except User.DoesNotExist:
            raise serializers.ValidationError({'otp_record_id': 'No account found for this reset session.'})

        return data

class RegisterInvitedSerializer(RegisterSerializer):
    invite_token = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        invite_token = attrs.get('invite_token', '').strip()
        email = attrs.get('email', '').lower().strip()

        if not invite_token:
            raise serializers.ValidationError({"invite_token": "Invitation token is required."})

        try:
            invite = StaffInvite.objects.get(id=invite_token)
        except (StaffInvite.DoesNotExist, ValueError):
            raise serializers.ValidationError({"invite_token": "This invitation link has expired. Please contact your administrator."})

        if not invite.is_valid():
            raise serializers.ValidationError({"invite_token": "This invitation link has expired. Please contact your administrator."})

        if invite.email.lower().strip() != email:
            raise serializers.ValidationError({"email": "This email does not match the invitation email."})

        # Force the role and department to match the invitation (Zero-Trust)
        attrs['role'] = invite.role
        attrs['department'] = invite.department
        self.context['invite'] = invite

        first_name = attrs.get('first_name', '')
        last_name = attrs.get('last_name', '')
        full_name = attrs.get('full_name', '')

        if not full_name:
            if first_name or last_name:
                attrs['full_name'] = f"{first_name} {last_name}".strip()
            else:
                raise serializers.ValidationError({"full_name": "Full name is required."})

        # Remove temporary fields before creating user
        attrs.pop('first_name', None)
        attrs.pop('last_name', None)
        return attrs

class LoginAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginAuditLog
        fields = (
            'id', 'email_attempted', 'ip_address', 'login_method',
            'success', 'failure_reason', 'timestamp'
        )
        read_only_fields = ('id', 'email_attempted', 'ip_address', 'login_method', 'success', 'failure_reason', 'timestamp')


class PMDCComplianceSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='user.full_name', read_only=True)
    doctor_email = serializers.CharField(source='user.email', read_only=True)
    days_to_expiry = serializers.SerializerMethodField()

    class Meta:
        from doctors.models import Doctor
        model = Doctor
        fields = (
            'id', 'doctor_name', 'doctor_email', 'user', 'specialization',
            'pmdc_expiry_date', 'license_status', 'days_to_expiry'
        )

    def get_days_to_expiry(self, obj):
        if obj.pmdc_expiry_date:
            from django.utils import timezone
            delta = obj.pmdc_expiry_date - timezone.now().date()
            return delta.days
        return None

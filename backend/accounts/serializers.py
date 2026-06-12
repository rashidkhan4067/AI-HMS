from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import PasswordResetOTP, Department, DoctorApplication, StaffInvite, LoginAuditLog, Patient, Doctor, DoctorAvailability, Appointment
from django.utils import timezone

User = get_user_model()


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


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ('id', 'name', 'description')


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
        return obj.department.name if obj.department else None


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
            full_name=validated_data.get('full_name', ''),
            role=role,
            department=department,
            is_active=True
        )

        if invite:
            invite.is_used = True
            invite.save(update_fields=['is_used'])

        try:
            from .utils import send_welcome_email
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


# ── Password Reset Flow ──────────────────────────────────────────────────────

class ForgotPasswordSerializer(serializers.Serializer):
    """
    Validates the email for password reset.
    Returns silently if email not found (prevents user enumeration).
    """
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower().strip()


class VerifyOtpSerializer(serializers.Serializer):
    """
    Validates the 6-digit OTP against the latest unused, unexpired record.
    """
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
    """
    Resets the password using the OTP record ID as a one-time token.
    """
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

        # Verify the record was used (marked by VerifyOtpView) and belongs to a real user
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
        import re
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
            from .utils import send_welcome_email
            send_welcome_email(user)
        except Exception:
            pass
        return user


class StaffInviteSerializer(serializers.ModelSerializer):
    department_name = serializers.SerializerMethodField(read_only=True)
    is_expired = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = StaffInvite
        fields = (
            'id', 'email', 'role', 'department', 'department_name',
            'is_used', 'created_at', 'expires_at', 'is_expired'
        )
        read_only_fields = ('id', 'is_used', 'created_at', 'expires_at', 'is_expired')

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

    def get_is_expired(self, obj):
        return timezone.now() > obj.expires_at

    def validate_email(self, value):
        val = value.lower().strip()
        # Check if active user already exists with this email
        if User.objects.filter(email=val, is_active=True).exists():
            raise serializers.ValidationError("An active user with this email address already exists.")
        # Check if an active invitation already exists with this email
        if StaffInvite.objects.filter(email=val, is_used=False, expires_at__gt=timezone.now()).exists():
            raise serializers.ValidationError("An active pending invitation for this email already exists.")
        return val


class LoginAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginAuditLog
        fields = (
            'id', 'email_attempted', 'ip_address', 'login_method',
            'success', 'failure_reason', 'timestamp'
        )
        read_only_fields = ('id', 'email_attempted', 'ip_address', 'login_method', 'success', 'failure_reason', 'timestamp')


class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Patient
        fields = ('id', 'user', 'mrn')
        read_only_fields = ('id', 'user', 'mrn')


class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='DOCTOR'),
        source='user',
        write_only=True
    )

    class Meta:
        model = Doctor
        fields = ('id', 'user', 'user_id', 'specialization', 'consultation_fee', 'bio', 'is_available')
        read_only_fields = ('id', 'user')

    def create(self, validated_data):
        user = validated_data.get('user')
        doctor, created = Doctor.objects.get_or_create(user=user, defaults=validated_data)
        if not created:
            for attr, value in validated_data.items():
                setattr(doctor, attr, value)
            doctor.save()
        return doctor


class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAvailability
        fields = ('id', 'doctor', 'day_of_week', 'start_time', 'end_time', 'slot_duration')
        read_only_fields = ('id',)

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("Start time must precede end time.")
        return data


class AppointmentSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), required=False)
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    patient_mrn = serializers.CharField(source='patient.mrn', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.full_name', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)

    class Meta:
        model = Appointment
        fields = (
            'id', 'patient', 'patient_name', 'patient_mrn', 
            'doctor', 'doctor_name', 'doctor_specialization', 
            'date', 'start_time', 'end_time', 'status', 'reason', 'created_at'
        )
        read_only_fields = ('id', 'created_at')

    def validate(self, data):
        doctor = data.get('doctor')
        patient = data.get('patient')
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        # Resolve patient from request user context if not passed
        request = self.context.get('request')
        if not patient and request and request.user:
            if request.user.role == 'PATIENT':
                if hasattr(request.user, 'patient_profile'):
                    patient = request.user.patient_profile
                else:
                    patient, _ = Patient.objects.get_or_create(user=request.user)
                # Assign to data dictionary so it is present in validated_data
                data['patient'] = patient
            else:
                # If admin or receptionist, they MUST specify the patient
                raise serializers.ValidationError({"patient": "This field is required for administrative bookings."})


        if not start_time or not end_time or not date:
            return data

        if start_time >= end_time:
            raise serializers.ValidationError("Appointment start time must be before end time.")

        # 1. Verify doctor availability schedule
        day_of_week = date.weekday()
        availabilities = DoctorAvailability.objects.filter(doctor=doctor, day_of_week=day_of_week)
        
        fits_availability = False
        for av in availabilities:
            if av.start_time <= start_time and end_time <= av.end_time:
                fits_availability = True
                break

        if not fits_availability:
            raise serializers.ValidationError(
                "Selected time is outside the doctor's published availability schedule for this day."
            )

        # Exclude current appointment if updating
        appointment_id = self.instance.id if self.instance else None

        # 2. Check doctor double-booking
        doctor_overlap = Appointment.objects.filter(
            doctor=doctor,
            date=date,
            status__in=['PENDING', 'CONFIRMED']
        ).exclude(id=appointment_id).filter(
            start_time__lt=end_time,
            end_time__gt=start_time
        ).exists()

        if doctor_overlap:
            raise serializers.ValidationError("This doctor is already booked for an overlapping appointment at the selected time.")

        # 3. Check patient double-booking
        patient_overlap = Appointment.objects.filter(
            patient=patient,
            date=date,
            status__in=['PENDING', 'CONFIRMED']
        ).exclude(id=appointment_id).filter(
            start_time__lt=end_time,
            end_time__gt=start_time
        ).exists()

        if patient_overlap:
            raise serializers.ValidationError("This patient is already booked for an overlapping appointment at the selected time.")

        return data



import uuid
import random
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta

class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class HMSUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifier
    for authentication instead of usernames.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)

class HMSUser(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        DOCTOR = 'DOCTOR', 'Doctor'
        NURSE = 'NURSE', 'Nurse'
        RECEPTIONIST = 'RECEPTIONIST', 'Receptionist'
        PHARMACIST = 'PHARMACIST', 'Pharmacist'
        LAB_TECHNICIAN = 'LAB_TECHNICIAN', 'Lab Technician'
        RADIOLOGIST = 'RADIOLOGIST', 'Radiologist'
        PATIENT = 'PATIENT', 'Patient'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.DOCTOR)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_google_user = models.BooleanField(default=False)
    google_sub = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    failed_attempts = models.PositiveIntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    must_complete_profile = models.BooleanField(default=False)
    employee_id = models.CharField(max_length=50, blank=True, null=True, unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Patient Profile Fields
    dob = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    cnic = models.CharField(max_length=20, blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=255, blank=True, null=True)
    emergency_contact_relationship = models.CharField(max_length=50, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=50, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    objects = HMSUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return f"{self.email} - {self.role}"

class LoginAuditLog(models.Model):
    user = models.ForeignKey(HMSUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='login_logs')
    email_attempted = models.EmailField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    login_method = models.CharField(max_length=50) # e.g. 'PASSWORD', 'GOOGLE'
    success = models.BooleanField()
    failure_reason = models.CharField(max_length=255, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Login attempt for {self.email_attempted} - Success: {self.success} ({self.timestamp})"

class PasswordResetOTP(models.Model):
    """
    Stores a short-lived 6-digit OTP for password reset.
    Each request generates a new record; old ones are invalidated on use.
    """
    email      = models.EmailField(_('email address'), db_index=True)
    otp        = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used    = models.BooleanField(default=False)

    OTP_LIFETIME_MINUTES = 10

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Password Reset OTP'
        verbose_name_plural = 'Password Reset OTPs'

    def save(self, *args, **kwargs):
        if not self.otp:
            self.otp = f"{random.randint(0, 999999):06d}"
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=self.OTP_LIFETIME_MINUTES)
        super().save(*args, **kwargs)

    def is_valid(self):
        """Return True if OTP is not used and has not expired."""
        return not self.is_used and timezone.now() <= self.expires_at

    def __str__(self):
        return f"OTP for {self.email} (used={self.is_used})"


class StaffInvite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=20, choices=HMSUser.Role.choices, default=HMSUser.Role.DOCTOR)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='invites')
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_used and timezone.now() <= self.expires_at

    def __str__(self):
        return f"Invite for {self.email} as {self.role} (used={self.is_used})"


class DoctorApplication(models.Model):
    class Gender(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'
        OTHER = 'OTHER', 'Other'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    dob = models.DateField()
    gender = models.CharField(max_length=20, choices=Gender.choices)
    city = models.CharField(max_length=100)
    
    specialization = models.CharField(max_length=100)
    pmdc_number = models.CharField(max_length=50)
    experience_years = models.PositiveIntegerField()
    current_hospital = models.CharField(max_length=255, blank=True, null=True)
    
    pmdc_certificate = models.FileField(upload_to='doctor_applications/certificates/')
    cnic_document = models.FileField(upload_to='doctor_applications/cnic/')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Doctor Application: {self.full_name} ({self.specialization}) - Status: {self.status}"

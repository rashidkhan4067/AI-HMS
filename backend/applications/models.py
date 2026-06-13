import uuid
from django.db import models

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

    class Meta:
        db_table = 'accounts_doctorapplication'

    def __str__(self):
        return f"Doctor Application: {self.full_name} ({self.specialization}) - Status: {self.status}"

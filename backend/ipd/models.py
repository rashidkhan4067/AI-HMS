import uuid
from django.db import models
from patients.models import Patient
from doctors.models import Doctor

class Ward(models.Model):
    CATEGORY_CHOICES = (
        ('GENERAL', 'General Ward'),
        ('PRIVATE', 'Private Room'),
        ('ICU', 'Intensive Care Unit'),
        ('CCU', 'Coronary Care Unit'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='GENERAL')
    department = models.ForeignKey('departments.Department', on_delete=models.SET_NULL, null=True, related_name='wards')
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        db_table = 'ipd_ward'

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

class Bed(models.Model):
    STATUS_CHOICES = (
        ('AVAILABLE', 'Available'),
        ('OCCUPIED', 'Occupied'),
        ('CLEANING', 'Under Cleaning'),
        ('MAINTENANCE', 'Out of Service'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ward = models.ForeignKey(Ward, on_delete=models.CASCADE, related_name='beds')
    bed_number = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')

    class Meta:
        db_table = 'ipd_bed'
        unique_together = ('ward', 'bed_number')

    def __str__(self):
        return f"{self.ward.name} - Bed {self.bed_number} ({self.status})"

class AdmissionRecord(models.Model):
    STATUS_CHOICES = (
        ('ADMITTED', 'Admitted'),
        ('DISCHARGED', 'Discharged'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='admissions')
    bed = models.ForeignKey(Bed, on_delete=models.CASCADE, related_name='admissions')
    attending_doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='admitted_patients')
    admitted_at = models.DateTimeField(auto_now_add=True)
    discharged_at = models.DateTimeField(null=True, blank=True)
    admission_reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ADMITTED')

    class Meta:
        db_table = 'ipd_admissionrecord'
        ordering = ['-admitted_at']

    def __str__(self):
        return f"Admission: {self.patient.user.full_name} in Bed {self.bed.bed_number} ({self.status})"

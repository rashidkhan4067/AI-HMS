import uuid
from django.db import models
from accounts.models import HMSUser
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment

class Vitals(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='vitals')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='vitals_records')
    blood_pressure = models.CharField(max_length=20, help_text="e.g. 120/80")
    heart_rate = models.PositiveIntegerField(help_text="Heart rate bpm")
    temperature = models.DecimalField(max_digits=4, decimal_places=1, help_text="Body temperature in °F")
    spo2 = models.PositiveIntegerField(help_text="Oxygen saturation %")
    respiratory_rate = models.PositiveIntegerField(null=True, blank=True, help_text="Breaths per minute")
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Weight in kg")
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Height in cm")
    recorded_by = models.ForeignKey(HMSUser, on_delete=models.SET_NULL, null=True, related_name='recorded_vitals')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'accounts_vitals'
        ordering = ['-created_at']

    def __str__(self):
        return f"Vitals for {self.patient.user.full_name} on {self.created_at.date()}"


class MedicalRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_records')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='created_records')
    appointment = models.OneToOneField(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='medical_record')
    diagnosis = models.TextField()
    treatment_plan = models.TextField(blank=True, null=True)
    prescription = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'accounts_medicalrecord'
        ordering = ['-created_at']

    def __str__(self):
        return f"Record: {self.patient.user.full_name} treated by {self.doctor} on {self.created_at.date()}"


class DiagnosticOrder(models.Model):
    CATEGORY_CHOICES = (
        ('LAB', 'Laboratory'),
        ('RADIOLOGY', 'Radiology'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='diagnostic_orders')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='ordered_diagnostics')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='diagnostic_orders')
    test_name = models.CharField(max_length=150)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clinical_diagnosticorder'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.category} Order: {self.test_name} for {self.patient.user.full_name} ({self.status})"


class DiagnosticResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(DiagnosticOrder, on_delete=models.CASCADE, related_name='result')
    performed_by = models.ForeignKey(HMSUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='performed_diagnostics')
    result_summary = models.CharField(max_length=255)
    report_text = models.TextField(blank=True, null=True)
    attachment_url = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clinical_diagnosticresult'
        ordering = ['-created_at']

    def __str__(self):
        return f"Result for {self.order.test_name} - {self.result_summary}"

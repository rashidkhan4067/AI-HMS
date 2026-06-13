import uuid
from django.db import models
from accounts.models import HMSUser
from clinical.models import MedicalRecord

class PrescriptionDispense(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('DISPENSED', 'Dispensed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_record = models.OneToOneField(MedicalRecord, on_delete=models.CASCADE, related_name='dispense')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    dispensed_by = models.ForeignKey(HMSUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='dispensed_prescriptions')
    dispensed_at = models.DateTimeField(null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Total cost of dispensed medicines")
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'accounts_prescriptiondispense'
        ordering = ['-created_at']

    def __str__(self):
        return f"Dispense for MR-{self.medical_record.id} ({self.status})"

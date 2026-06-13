import uuid
from django.db import models
from patients.models import Patient
from appointments.models import Appointment

class Invoice(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PARTIALLY_PAID', 'Partially Paid'),
        ('PAID', 'Paid'),
        ('REFUNDED', 'Refunded'),
    )

    METHOD_CHOICES = (
        ('CASH', 'Cash'),
        ('CARD', 'Card'),
        ('MOBILE_PAY', 'Mobile Pay'),
        ('INSURANCE', 'Insurance'),
        ('MIXED', 'Mixed'),
    )

    INSURANCE_PROVIDERS = (
        ('SEHAT_CARD', 'Sehat Sahulat Card'),
        ('STATE_LIFE', 'State Life Insurance'),
        ('JUBILEE', 'Jubilee Life Insurance'),
        ('EFU', 'EFU General Insurance'),
        ('ASKARI', 'Askari General Insurance'),
        ('TPL', 'TPL Insurance'),
        ('OTHER', 'Other Panel / Insurance'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoice')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='invoices')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    insurance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    insurance_provider = models.CharField(max_length=50, choices=INSURANCE_PROVIDERS, null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'accounts_invoice'
        ordering = ['-created_at']

    def __str__(self):
        return f"Invoice for {self.patient.user.full_name} - {self.amount} ({self.payment_status})"

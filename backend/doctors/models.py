import uuid
from django.db import models
from accounts.models import HMSUser

class Doctor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(HMSUser, on_delete=models.CASCADE, related_name='doctor_profile', limit_choices_to={'role': 'DOCTOR'})
    specialization = models.CharField(max_length=100)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    bio = models.TextField(blank=True, null=True)
    is_available = models.BooleanField(default=True)
    pmdc_expiry_date = models.DateField(null=True, blank=True, help_text="Expiry date of PMDC registration")
    license_status = models.CharField(
        max_length=20,
        choices=(('ACTIVE', 'Active'), ('EXPIRED', 'Expired'), ('PENDING_RENEWAL', 'Pending Renewal')),
        default='ACTIVE'
    )

    class Meta:
        db_table = 'accounts_doctor'

    def __str__(self):
        return f"Dr. {self.user.full_name} ({self.specialization})"

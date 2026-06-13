import uuid
import random
from django.db import models
from django.utils import timezone
from accounts.models import HMSUser

class Patient(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(HMSUser, on_delete=models.CASCADE, related_name='patient_profile', limit_choices_to={'role': 'PATIENT'})
    mrn = models.CharField(max_length=50, unique=True, db_index=True)

    class Meta:
        db_table = 'accounts_patient'

    def save(self, *args, **kwargs):
        if not self.mrn:
            year = timezone.now().year
            prefix = f"MRN-{year}-"
            last_patient = Patient.objects.filter(mrn__startswith=prefix).order_by('-mrn').first()
            if last_patient:
                try:
                    last_seq = int(last_patient.mrn.split('-')[-1])
                    new_seq = last_seq + 1
                except ValueError:
                    new_seq = random.randint(1000, 9999)
            else:
                new_seq = 1
            self.mrn = f"{prefix}{new_seq:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.full_name} ({self.mrn})"

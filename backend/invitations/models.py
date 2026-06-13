import uuid
from django.db import models
from django.utils import timezone
from datetime import timedelta
from accounts.models import HMSUser
from departments.models import Department

class StaffInvite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField('email address', unique=True)
    role = models.CharField(max_length=20, choices=HMSUser.Role.choices, default=HMSUser.Role.DOCTOR)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='invites')
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'accounts_staffinvite'

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_used and timezone.now() <= self.expires_at

    def __str__(self):
        return f"Invite for {self.email} as {self.role} (used={self.is_used})"

import uuid
from django.db import models
from accounts.models import HMSUser

class DutyRoster(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    staff_member = models.ForeignKey(HMSUser, on_delete=models.CASCADE, related_name='rosters')
    shift_start = models.DateTimeField()
    shift_end = models.DateTimeField()
    department = models.ForeignKey('departments.Department', on_delete=models.CASCADE)
    notes = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'operational_dutyroster'
        ordering = ['shift_start']

    def __str__(self):
        return f"{self.staff_member.full_name} ({self.shift_start.date()})"

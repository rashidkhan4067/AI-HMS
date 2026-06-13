from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from roster.models import DutyRoster
from roster.serializers import DutyRosterSerializer
from accounts.permissions import IsAdminUser

class DutyRosterViewSet(viewsets.ModelViewSet):
    queryset = DutyRoster.objects.select_related('staff_member', 'department').all()
    serializer_class = DutyRosterSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        # Only admins can create, update, delete rosters
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

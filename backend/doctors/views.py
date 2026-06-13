from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from doctors.models import Doctor
from doctors.serializers import DoctorProfileSerializer
from accounts.permissions import IsAdminUser

class DoctorViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for Doctor profiles.
    - List/Retrieve is available to all authenticated users (so patients can browse doctors).
    - Create/Update/Delete is restricted to Admin.
    """
    queryset = Doctor.objects.all().select_related('user', 'user__department')
    serializer_class = DoctorProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        specialization = self.request.query_params.get('specialization')
        department_name = self.request.query_params.get('department')
        if specialization:
            qs = qs.filter(specialization__icontains=specialization)
        if department_name:
            qs = qs.filter(user__department__name__icontains=department_name)
        return qs

from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Count
from departments.models import Department
from departments.serializers import DepartmentSerializer, AdminDepartmentSerializer
from accounts.permissions import IsAdminUser

class DepartmentListView(generics.ListAPIView):
    permission_classes = (AllowAny,)
    serializer_class = DepartmentSerializer
    queryset = Department.objects.filter(is_active=True).order_by('name')

class AdminDepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet to manage Hospital Departments. Restricted to Admin.
    """
    permission_classes = (IsAuthenticated, IsAdminUser)
    serializer_class = AdminDepartmentSerializer

    def get_queryset(self):
        return Department.objects.annotate(staff_count=Count('users')).order_by('name')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        assigned_count = instance.users.count()
        if assigned_count > 0:
            return Response(
                {'detail': f'Cannot delete department "{instance.name}" — {assigned_count} staff member(s) are currently assigned. Reassign them first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

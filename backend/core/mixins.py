from rest_framework.exceptions import PermissionDenied
from core.constants import ROLE_PATIENT, ROLE_DOCTOR

class RoleBasedSecurityMixin:
    """
    Standardizes row-level security and permission checks across API views.
    Extend this mixin and configure `patient_field` and `doctor_field` to 
    automatically filter querysets and restrict object creation/updates.
    """
    patient_field = 'patient__user'
    doctor_field = 'doctor__user'

    def get_role_filtered_queryset(self, qs):
        """Filters the queryset based on the requesting user's role."""
        user = self.request.user
        if user.role == ROLE_PATIENT:
            return qs.filter(**{self.patient_field: user})
        if user.role == ROLE_DOCTOR:
            return qs.filter(**{self.doctor_field: user})
        return qs

    def enforce_patient_ownership(self, instance):
        """Raises PermissionDenied if the PATIENT does not own the instance."""
        user = self.request.user
        if user.role == ROLE_PATIENT:
            # Resolves nested attributes like instance.patient.user
            attrs = self.patient_field.split('__')
            owner = instance
            for attr in attrs:
                owner = getattr(owner, attr, None)
            if owner != user:
                raise PermissionDenied("You can only access or modify your own records.")

    def enforce_doctor_ownership(self, instance):
        """Raises PermissionDenied if the DOCTOR does not own the instance."""
        user = self.request.user
        if user.role == ROLE_DOCTOR:
            attrs = self.doctor_field.split('__')
            owner = instance
            for attr in attrs:
                owner = getattr(owner, attr, None)
            if owner != user:
                raise PermissionDenied("You can only access or modify records assigned to you.")

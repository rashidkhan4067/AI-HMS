from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """Allows access only to Admin users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')


class IsDoctorUser(BasePermission):
    """Allows access only to Doctor users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'DOCTOR')


class IsNurseUser(BasePermission):
    """Allows access only to Nurse users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'NURSE')


class IsReceptionistUser(BasePermission):
    """Allows access only to Receptionist users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'RECEPTIONIST')


class IsPharmacistUser(BasePermission):
    """Allows access only to Pharmacist users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'PHARMACIST')


class IsLabTechnicianUser(BasePermission):
    """Allows access only to Lab Technician users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'LAB_TECHNICIAN')


class IsRadiologistUser(BasePermission):
    """Allows access only to Radiologist users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'RADIOLOGIST')


class IsAdminOrDoctor(BasePermission):
    """Allows access to Admin or Doctor users (common clinical read pattern)."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in ('ADMIN', 'DOCTOR')
        )


class IsClinicalStaff(BasePermission):
    """Allows access to any clinical staff role (Admin, Doctor, Nurse, Receptionist, Pharmacist, Lab Technician, Radiologist)."""
    CLINICAL_ROLES = {'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN', 'RADIOLOGIST'}

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in self.CLINICAL_ROLES
        )

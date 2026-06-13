from rest_framework.permissions import BasePermission
from core.constants import (
    ROLE_ADMIN, ROLE_DOCTOR, ROLE_NURSE, ROLE_RECEPTIONIST, 
    ROLE_PHARMACIST, ROLE_LAB_TECHNICIAN, ROLE_RADIOLOGIST, 
    ROLE_PATIENT, CLINICAL_ROLES
)

class IsAdminUser(BasePermission):
    """Allows access only to Admin users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == ROLE_ADMIN)

class IsDoctorUser(BasePermission):
    """Allows access only to Doctor users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == ROLE_DOCTOR)

class IsNurseUser(BasePermission):
    """Allows access only to Nurse users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == ROLE_NURSE)

class IsReceptionistUser(BasePermission):
    """Allows access only to Receptionist users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == ROLE_RECEPTIONIST)

class IsPharmacistUser(BasePermission):
    """Allows access only to Pharmacist users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == ROLE_PHARMACIST)

class IsLabTechnicianUser(BasePermission):
    """Allows access only to Lab Technician users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == ROLE_LAB_TECHNICIAN)

class IsRadiologistUser(BasePermission):
    """Allows access only to Radiologist users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == ROLE_RADIOLOGIST)

class IsClinicalStaff(BasePermission):
    """Allows access to any clinical staff role."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in CLINICAL_ROLES
        )

class IsAdminOrDoctor(BasePermission):
    """Allows access to Admin or Doctor users (common clinical read pattern)."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in (ROLE_ADMIN, ROLE_DOCTOR)
        )

class HasMedicalRecordAccess(BasePermission):
    """
    HIPAA-compliant custom access control class.
    - System Admins and Receptionists are strictly denied clinical data access.
    - Authorized Clinical Care Roles (Doctors, Nurses, Radiologists, Lab Technicians) are allowed read access.
    - Patients can read their own medical records.
    - Only the Doctor who treated the patient can create or edit the record.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.role in (ROLE_ADMIN, ROLE_RECEPTIONIST):
            return False
            
        ALLOWED_ROLES = set(CLINICAL_ROLES) | {ROLE_PATIENT}
        return request.user.role in ALLOWED_ROLES

    def has_object_permission(self, request, view, obj):
        user = request.user
        
        if user.role == ROLE_PATIENT:
            return obj.patient.user == user
            
        if user.role == ROLE_DOCTOR:
            if request.method in ('GET', 'HEAD', 'OPTIONS'):
                return True
            return obj.doctor.user == user
            
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
            
        return False

class IsAdminOrReceptionist(BasePermission):
    """Allows access only to Admin or Receptionist users."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in (ROLE_ADMIN, ROLE_RECEPTIONIST)
        )

class IsNurseOrAdmin(BasePermission):
    """Allows access only to Admin or Nurse users."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in (ROLE_ADMIN, ROLE_NURSE)
        )

class IsPharmacistOrAdmin(BasePermission):
    """Allows access only to Admin or Pharmacist users."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in (ROLE_ADMIN, ROLE_PHARMACIST)
        )

class IsAdminOrReceptionistOrPharmacist(BasePermission):
    """Allows access only to Admin, Receptionist, or Pharmacist users."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in (ROLE_ADMIN, ROLE_RECEPTIONIST, ROLE_PHARMACIST)
        )

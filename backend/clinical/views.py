from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from clinical.models import Vitals, MedicalRecord, DiagnosticOrder, DiagnosticResult
from clinical.serializers import VitalsSerializer, MedicalRecordSerializer, DiagnosticOrderSerializer, DiagnosticResultSerializer
from accounts.permissions import IsNurseOrAdmin, HasMedicalRecordAccess
from core.mixins import RoleBasedSecurityMixin
from core.constants import ROLE_PATIENT, ROLE_DOCTOR, ROLE_ADMIN, ROLE_LAB_TECHNICIAN, ROLE_RADIOLOGIST

class VitalsViewSet(RoleBasedSecurityMixin, viewsets.ModelViewSet):
    """
    ModelViewSet for Patient Triage Vitals.
    - Write operations (create, update, partial_update, destroy) restricted to Nurse and Admin.
    - Read operations open to clinical roles (Doctor, Nurse, etc.) and the Patient owner.
    """
    queryset = Vitals.objects.all().select_related('patient', 'patient__user', 'appointment', 'recorded_by')
    serializer_class = VitalsSerializer
    permission_classes = [IsAuthenticated]
    patient_field = 'patient__user'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsNurseOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if user.role == ROLE_PATIENT:
            return self.get_role_filtered_queryset(qs)

        # Staff filters
        patient_id = self.request.query_params.get('patient_id')
        appointment_id = self.request.query_params.get('appointment_id')
        mrn = self.request.query_params.get('mrn')

        if patient_id: qs = qs.filter(patient_id=patient_id)
        if appointment_id: qs = qs.filter(appointment_id=appointment_id)
        if mrn: qs = qs.filter(patient__mrn__iexact=mrn)

        return qs

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class MedicalRecordViewSet(RoleBasedSecurityMixin, viewsets.ModelViewSet):
    """
    ModelViewSet for Patient Medical Records.
    - Accessible only by authorized clinical roles and the owner Patient.
    - Admins and Receptionists are strictly denied.
    """
    queryset = MedicalRecord.objects.all().select_related('patient', 'patient__user', 'doctor', 'doctor__user', 'appointment')
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated, HasMedicalRecordAccess]
    patient_field = 'patient__user'
    doctor_field = 'doctor__user'

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if user.role == ROLE_PATIENT:
            return self.get_role_filtered_queryset(qs)

        # For clinical roles
        patient_id = self.request.query_params.get('patient_id')
        doctor_id = self.request.query_params.get('doctor_id')
        appointment_id = self.request.query_params.get('appointment_id')
        mrn = self.request.query_params.get('mrn')

        if patient_id: qs = qs.filter(patient_id=patient_id)
        if doctor_id: qs = qs.filter(doctor_id=doctor_id)
        if appointment_id: qs = qs.filter(appointment_id=appointment_id)
        if mrn: qs = qs.filter(patient__mrn__iexact=mrn)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != ROLE_DOCTOR:
            raise PermissionDenied("Only doctor accounts can log clinical medical records.")
        
        if not hasattr(user, 'doctor_profile'):
            raise PermissionDenied("You must complete your doctor profile before logging clinical records.")
            
        serializer.save(doctor=user.doctor_profile)


class DiagnosticOrderViewSet(RoleBasedSecurityMixin, viewsets.ModelViewSet):
    """
    ModelViewSet for Patient Diagnostic Orders (Lab & Radiology).
    """
    queryset = DiagnosticOrder.objects.all().select_related(
        'patient', 'patient__user', 'doctor', 'doctor__user', 'appointment'
    ).prefetch_related('result', 'result__performed_by')
    serializer_class = DiagnosticOrderSerializer
    permission_classes = [IsAuthenticated]
    patient_field = 'patient__user'
    doctor_field = 'doctor__user'

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if user.role == ROLE_PATIENT:
            return self.get_role_filtered_queryset(qs)
        elif user.role == ROLE_LAB_TECHNICIAN:
            return qs.filter(category='LAB')
        elif user.role == ROLE_RADIOLOGIST:
            return qs.filter(category='RADIOLOGY')

        # Doctors, Nurses, and Admins can see all
        patient_id = self.request.query_params.get('patient_id')
        doctor_id = self.request.query_params.get('doctor_id')
        category = self.request.query_params.get('category')
        status = self.request.query_params.get('status')
        mrn = self.request.query_params.get('mrn')

        if patient_id: qs = qs.filter(patient_id=patient_id)
        if doctor_id: qs = qs.filter(doctor_id=doctor_id)
        if category: qs = qs.filter(category=category)
        if status: qs = qs.filter(status=status)
        if mrn: qs = qs.filter(patient__mrn__iexact=mrn)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != ROLE_DOCTOR:
            raise PermissionDenied("Only doctors can order diagnostic tests.")
        if not hasattr(user, 'doctor_profile'):
            raise PermissionDenied("You must complete your doctor profile before ordering tests.")
        
        serializer.save(doctor=user.doctor_profile)

    @action(detail=True, methods=['post'], url_path='submit-result')
    def submit_result(self, request, pk=None):
        order = self.get_object()
        user = request.user

        # Role checks
        if order.category == 'LAB' and user.role not in (ROLE_LAB_TECHNICIAN, ROLE_ADMIN):
            raise PermissionDenied("Only lab technicians can submit laboratory results.")
        if order.category == 'RADIOLOGY' and user.role not in (ROLE_RADIOLOGIST, ROLE_ADMIN):
            raise PermissionDenied("Only radiologists can submit radiology scans.")

        if order.status == 'COMPLETED':
            return Response({'detail': 'This order has already been completed.'}, status=status.HTTP_400_BAD_REQUEST)

        # Serialize and save result
        serializer = DiagnosticResultSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(order=order, performed_by=user)
        order.status = 'COMPLETED'
        order.save()
        
        return Response(DiagnosticOrderSerializer(order).data, status=status.HTTP_201_CREATED)

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import DoctorAvailability, Appointment
from appointments.serializers import DoctorAvailabilitySerializer, AppointmentSerializer
from core.mixins import RoleBasedSecurityMixin
from core.constants import ROLE_PATIENT, ROLE_DOCTOR, ROLE_ADMIN, ROLE_RECEPTIONIST

class DoctorAvailabilityViewSet(RoleBasedSecurityMixin, viewsets.ModelViewSet):
    queryset = DoctorAvailability.objects.all().select_related('doctor', 'doctor__user')
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [IsAuthenticated]
    doctor_field = 'doctor__user'

    def get_queryset(self):
        qs = super().get_queryset()
        # Only doctors and admins/receptionists usually need special filters,
        # but DoctorAvailability is public read for anyone to book.
        doctor_id = self.request.query_params.get('doctor_id')
        day_of_week = self.request.query_params.get('day_of_week')
        if doctor_id: qs = qs.filter(doctor_id=doctor_id)
        if day_of_week is not None: qs = qs.filter(day_of_week=day_of_week)
        return qs

    def perform_create(self, serializer):
        if self.request.user.role not in (ROLE_ADMIN, ROLE_DOCTOR):
            raise PermissionDenied("You do not have permission to configure doctor availability.")
        
        doctor = serializer.validated_data.get('doctor')
        if self.request.user.role == ROLE_DOCTOR:
            if getattr(self.request.user, 'doctor_profile', None) != doctor:
                raise PermissionDenied("You can only configure shift availabilities for your own doctor profile.")
                
        serializer.save()

    def perform_update(self, serializer):
        av = self.get_object()
        if self.request.user.role not in (ROLE_ADMIN, ROLE_DOCTOR):
            raise PermissionDenied("You do not have permission to modify doctor availability.")
            
        self.enforce_doctor_ownership(av)
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role not in (ROLE_ADMIN, ROLE_DOCTOR):
            raise PermissionDenied("You do not have permission to delete doctor availability.")
            
        self.enforce_doctor_ownership(instance)
        instance.delete()


class AppointmentViewSet(RoleBasedSecurityMixin, viewsets.ModelViewSet):
    queryset = Appointment.objects.all().select_related('patient', 'patient__user', 'doctor', 'doctor__user')
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    patient_field = 'patient__user'
    doctor_field = 'doctor__user'

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        # Apply Row Level Security via Mixin
        if user.role in (ROLE_PATIENT, ROLE_DOCTOR):
            qs = self.get_role_filtered_queryset(qs)
        elif user.role not in (ROLE_ADMIN, ROLE_RECEPTIONIST, 'NURSE', 'LAB_TECHNICIAN', 'RADIOLOGIST'):
            return qs.none()

        # Apply specific query params
        doctor_id = self.request.query_params.get('doctor_id')
        patient_id = self.request.query_params.get('patient_id')
        date = self.request.query_params.get('date')
        status = self.request.query_params.get('status')

        if doctor_id: qs = qs.filter(doctor_id=doctor_id)
        if patient_id: qs = qs.filter(patient_id=patient_id)
        if date: qs = qs.filter(date=date)
        if status: qs = qs.filter(status=status)

        return qs

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == ROLE_PATIENT:
            patient, _ = Patient.objects.get_or_create(user=user)
            serializer.save(patient=patient)
        elif user.role in (ROLE_ADMIN, ROLE_RECEPTIONIST):
            serializer.save()
        else:
            raise PermissionDenied("You do not have permission to book appointments.")

    def perform_update(self, serializer):
        user = self.request.user
        appt = self.get_object()

        if user.role == ROLE_PATIENT:
            self.enforce_patient_ownership(appt)
            if serializer.validated_data.get('status', appt.status) != 'CANCELLED':
                raise PermissionDenied("Patients can only cancel appointments.")
            serializer.save(patient=appt.patient, doctor=appt.doctor, date=appt.date, start_time=appt.start_time, end_time=appt.end_time)
            
        elif user.role == ROLE_DOCTOR:
            self.enforce_doctor_ownership(appt)
            serializer.save(patient=appt.patient, doctor=appt.doctor, date=appt.date, start_time=appt.start_time, end_time=appt.end_time)
            
        elif user.role in (ROLE_ADMIN, ROLE_RECEPTIONIST):
            serializer.save()
        else:
            raise PermissionDenied("You do not have permission to update appointments.")

    def perform_destroy(self, instance):
        if self.request.user.role not in (ROLE_ADMIN, ROLE_RECEPTIONIST):
            raise PermissionDenied("Only administrators and receptionists can delete appointment entries.")
        instance.delete()

from rest_framework import serializers
from appointments.models import Appointment, DoctorAvailability
from patients.models import Patient
from doctors.models import Doctor
from clinical.serializers import VitalsSerializer

class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAvailability
        fields = ('id', 'doctor', 'day_of_week', 'start_time', 'end_time', 'slot_duration')
        read_only_fields = ('id',)

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("Start time must precede end time.")
        return data


class AppointmentSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), required=False)
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    patient_mrn = serializers.CharField(source='patient.mrn', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.full_name', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    doctor_consultation_fee = serializers.DecimalField(source='doctor.consultation_fee', max_digits=10, decimal_places=2, read_only=True)
    vitals = VitalsSerializer(read_only=True, allow_null=True)

    class Meta:
        model = Appointment
        fields = (
            'id', 'patient', 'patient_name', 'patient_mrn', 
            'doctor', 'doctor_name', 'doctor_specialization', 'doctor_consultation_fee',
            'date', 'start_time', 'end_time', 'status', 'reason', 'created_at', 'vitals'
        )
        read_only_fields = ('id', 'created_at')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            if request.user.role == 'ADMIN':
                data['reason'] = "[REDACTED]"
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(
                    f"Admin {request.user.email} accessed "
                    f"Appointment {instance.id} reason - clinical data redacted"
                )
        return data

    def validate(self, data):
        doctor = data.get('doctor')
        patient = data.get('patient')
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        # Resolve patient from request user context if not passed
        request = self.context.get('request')
        if not patient and request and request.user:
            if request.user.role == 'PATIENT':
                if hasattr(request.user, 'patient_profile'):
                    patient = request.user.patient_profile
                else:
                    patient, _ = Patient.objects.get_or_create(user=request.user)
                # Assign to data dictionary so it is present in validated_data
                data['patient'] = patient
            else:
                # If admin or receptionist, they MUST specify the patient
                raise serializers.ValidationError({"patient": "This field is required for administrative bookings."})

        if not start_time or not end_time or not date:
            return data

        if start_time >= end_time:
            raise serializers.ValidationError("Appointment start time must be before end time.")

        # 1. Verify doctor availability schedule
        day_of_week = date.weekday()
        availabilities = DoctorAvailability.objects.filter(doctor=doctor, day_of_week=day_of_week)
        
        fits_availability = False
        for av in availabilities:
            if av.start_time <= start_time and end_time <= av.end_time:
                fits_availability = True
                break

        if not fits_availability:
            raise serializers.ValidationError(
                "Selected time is outside the doctor's published availability schedule for this day."
            )

        # Exclude current appointment if updating
        appointment_id = self.instance.id if self.instance else None

        # 2. Check doctor double-booking
        doctor_overlap = Appointment.objects.filter(
            doctor=doctor,
            date=date,
            status__in=['PENDING', 'CONFIRMED']
        ).exclude(id=appointment_id).filter(
            start_time__lt=end_time,
            end_time__gt=start_time
        ).exists()

        if doctor_overlap:
            raise serializers.ValidationError("This doctor is already booked for an overlapping appointment at the selected time.")

        # 3. Check patient double-booking
        patient_overlap = Appointment.objects.filter(
            patient=patient,
            date=date,
            status__in=['PENDING', 'CONFIRMED']
        ).exclude(id=appointment_id).filter(
            start_time__lt=end_time,
            end_time__gt=start_time
        ).exists()

        if patient_overlap:
            raise serializers.ValidationError("This patient is already booked for an overlapping appointment at the selected time.")

        return data

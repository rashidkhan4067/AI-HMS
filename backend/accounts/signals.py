from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from patients.models import Patient
from doctors.models import Doctor
from applications.models import DoctorApplication
from clinical.models import MedicalRecord
from pharmacy.models import PrescriptionDispense

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Post-save signal to automatically generate Patient or Doctor profile records
    when a new HMSUser account is created.
    """
    if created:
        if instance.role == 'PATIENT':
            Patient.objects.get_or_create(user=instance)
        elif instance.role == 'DOCTOR':
            # Check if there is an approved doctor onboarding application
            # matching the email to pre-fill specialization or details.
            app = DoctorApplication.objects.filter(email=instance.email, status='APPROVED').first()
            spec = app.specialization if app else 'General Medicine'
            Doctor.objects.get_or_create(
                user=instance,
                defaults={
                    'specialization': spec,
                }
            )


@receiver(post_save, sender=MedicalRecord)
def create_prescription_dispense(sender, instance, created, **kwargs):
    """
    Post-save signal to automatically generate a PrescriptionDispense record
    when a new MedicalRecord containing prescription text is finalized.
    """
    if created and instance.prescription and instance.prescription.strip():
        PrescriptionDispense.objects.get_or_create(
            medical_record=instance,
            defaults={
                'status': 'PENDING',
                'amount': 0.00
            }
        )

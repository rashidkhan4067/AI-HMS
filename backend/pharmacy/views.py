from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from pharmacy.models import PrescriptionDispense
from billing.models import Invoice
from pharmacy.serializers import PrescriptionDispenseSerializer
from accounts.permissions import IsPharmacistOrAdmin

class PrescriptionDispenseViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for PrescriptionDispense.
    - List/Retrieve is open to clinical staff (Doctors, Nurses, Pharmacists, Admins) and the Patient owner.
    - Create/Update/Delete is strictly restricted to Pharmacists and Admins.
    """
    queryset = PrescriptionDispense.objects.all().select_related('medical_record', 'medical_record__patient', 'medical_record__patient__user', 'medical_record__doctor', 'medical_record__doctor__user', 'dispensed_by')
    serializer_class = PrescriptionDispenseSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsPharmacistOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.role == 'PATIENT':
            return qs.filter(medical_record__patient__user=user)

        # Filters for staff
        status_param = self.request.query_params.get('status')
        mrn = self.request.query_params.get('mrn')
        patient_id = self.request.query_params.get('patient_id')

        if status_param:
            qs = qs.filter(status=status_param)
        if mrn:
            qs = qs.filter(medical_record__patient__mrn__iexact=mrn)
        if patient_id:
            qs = qs.filter(medical_record__patient_id=patient_id)

        return qs

    def perform_update(self, serializer):
        # When pharmacist dispenses, record status, time, who dispensed, and automatically create Invoice.
        status_val = self.request.data.get('status', 'PENDING')
        
        if status_val == 'DISPENSED':
            dispense = serializer.save(
                status='DISPENSED',
                dispensed_by=self.request.user,
                dispensed_at=timezone.now()
            )
            
            # Automatically create Invoice for pharmacy if price/amount is set > 0
            if dispense.amount > 0:
                Invoice.objects.create(
                    patient=dispense.medical_record.patient,
                    appointment=dispense.medical_record.appointment,
                    amount=dispense.amount,
                    payment_status='PENDING',
                    payment_method=None
                )
        else:
            serializer.save()

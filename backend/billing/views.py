from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from billing.models import Invoice
from billing.serializers import InvoiceSerializer
from billing.services import get_revenue_reconciliation, get_billing_oversight_data
from accounts.permissions import IsAdminOrReceptionistOrPharmacist, IsAdminUser
from core.mixins import RoleBasedSecurityMixin
from core.constants import ROLE_PATIENT, INVOICE_STATUS_PAID, APPT_STATUS_CONFIRMED, APPT_STATUS_PENDING

class InvoiceViewSet(RoleBasedSecurityMixin, viewsets.ModelViewSet):
    """
    ModelViewSet for Invoices & Payments.
    - List/Retrieve is open to all authenticated users (row-level security for Patients).
    - Create/Update/Delete is strictly restricted to Receptionists and Admins.
    """
    queryset = Invoice.objects.all().select_related('patient', 'patient__user', 'appointment', 'appointment__doctor', 'appointment__doctor__user')
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    patient_field = 'patient__user'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrReceptionistOrPharmacist()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        payment_status = self.request.data.get('payment_status', INVOICE_STATUS_PAID)
        invoice = serializer.save(payment_status=payment_status)
        
        if invoice.appointment and invoice.appointment.status == APPT_STATUS_PENDING:
            invoice.appointment.status = APPT_STATUS_CONFIRMED
            invoice.appointment.save(update_fields=['status'])

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if user.role == ROLE_PATIENT:
            return self.get_role_filtered_queryset(qs)

        # Filtering for staff
        patient_id = self.request.query_params.get('patient_id')
        payment_status = self.request.query_params.get('payment_status')
        mrn = self.request.query_params.get('mrn')
        date_str = self.request.query_params.get('date')
        payment_method = self.request.query_params.get('payment_method')

        if patient_id: qs = qs.filter(patient_id=patient_id)
        if payment_status: qs = qs.filter(payment_status=payment_status)
        if mrn: qs = qs.filter(patient__mrn__iexact=mrn)
        if date_str: qs = qs.filter(created_at__date=date_str)
        if payment_method: qs = qs.filter(payment_method=payment_method)

        return qs

class AdminRevenueReconciliationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        data = get_revenue_reconciliation(timezone.now().date())
        return Response(data, status=status.HTTP_200_OK)

class AdminBillingOversightView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        data = get_billing_oversight_data(timezone.now().date())
        return Response(data, status=status.HTTP_200_OK)

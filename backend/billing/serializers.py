from rest_framework import serializers
from billing.models import Invoice

class InvoiceSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    patient_mrn = serializers.CharField(source='patient.mrn', read_only=True)
    doctor_name = serializers.CharField(source='appointment.doctor.user.full_name', read_only=True)
    doctor_specialization = serializers.CharField(source='appointment.doctor.specialization', read_only=True)

    class Meta:
        model = Invoice
        fields = (
            'id', 'appointment', 'patient', 'patient_name', 'patient_mrn',
            'doctor_name', 'doctor_specialization', 'amount',
            'paid_amount', 'insurance_amount', 'insurance_provider', 'due_date',
            'payment_status', 'payment_method', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate(self, attrs):
        amount = attrs.get('amount')
        if amount is None and self.instance:
            amount = self.instance.amount

        paid_amount = attrs.get('paid_amount')
        if paid_amount is None:
            if self.instance:
                paid_amount = self.instance.paid_amount
            else:
                paid_amount = 0

        insurance_amount = attrs.get('insurance_amount')
        if insurance_amount is None:
            if self.instance:
                insurance_amount = self.instance.insurance_amount
            else:
                insurance_amount = 0

        due_date = attrs.get('due_date')
        if due_date is None and self.instance:
            due_date = self.instance.due_date

        total_paid = paid_amount + insurance_amount
        
        if amount is not None and total_paid < amount:
            if not due_date:
                raise serializers.ValidationError({
                    "due_date": "Due date is required for partial or unpaid invoices."
                })
        return attrs

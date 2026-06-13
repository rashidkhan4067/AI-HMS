from django.db.models import Sum, Count
from billing.models import Invoice
from pharmacy.models import PrescriptionDispense
from datetime import timedelta

def get_revenue_reconciliation(today):
    # 1. Reconciliation by payment type
    payment_reconciliation = Invoice.objects.filter(payment_status='PAID').values('payment_method').annotate(
        total_collected=Sum('amount'),
        transaction_count=Count('id')
    )

    # 2. Pharmacy Revenue details
    pharmacy_revenue = PrescriptionDispense.objects.filter(status='DISPENSED').aggregate(
        total=Sum('amount'),
        count=Count('id')
    )

    # 3. Doctor consultation fees with FBR standard 10% withholding tax
    consultations = Invoice.objects.filter(payment_status='PAID', appointment__isnull=False).aggregate(
        gross_fees=Sum('amount'),
        count=Count('id')
    )

    gross = float(consultations['gross_fees'] or 0.0)
    withholding_tax = gross * 0.10
    net_doctor_payout = gross - withholding_tax

    return {
        'date_generated': today,
        'billing_reconciliation': payment_reconciliation,
        'pharmacy_sales': {
            'total_amount': float(pharmacy_revenue['total'] or 0.00),
            'total_dispensed': pharmacy_revenue['count']
        },
        'doctor_consultations': {
            'gross_amount': gross,
            'withholding_tax_deducted': withholding_tax,
            'net_payout': net_doctor_payout,
            'count': consultations['count']
        }
    }

def get_billing_oversight_data(today):
    total_collected = Invoice.objects.filter(payment_status__in=['PAID', 'PARTIALLY_PAID']).aggregate(total=Sum('paid_amount'))['total'] or 0.00
    
    pending_invoices = Invoice.objects.filter(payment_status__in=['PENDING', 'PARTIALLY_PAID'])
    patient_receivables = sum([float(inv.amount) - float(inv.paid_amount) - float(inv.insurance_amount) for inv in pending_invoices if float(inv.amount) - float(inv.paid_amount) - float(inv.insurance_amount) > 0])
            
    insurance_receivables = Invoice.objects.filter(payment_status__in=['PENDING', 'PARTIALLY_PAID']).aggregate(total=Sum('insurance_amount'))['total'] or 0.00

    overdue_invoices = Invoice.objects.filter(payment_status__in=['PENDING', 'PARTIALLY_PAID'], due_date__lt=today)
    total_overdue = sum([float(inv.amount) - float(inv.paid_amount) for inv in overdue_invoices if float(inv.amount) - float(inv.paid_amount) > 0])
            
    overdue_alerts = sorted([{
        'id': str(inv.id),
        'patient_name': inv.patient.user.full_name,
        'patient_mrn': inv.patient.mrn,
        'amount': float(inv.amount),
        'paid_amount': float(inv.paid_amount),
        'insurance_amount': float(inv.insurance_amount),
        'remaining_balance': float(inv.amount) - float(inv.paid_amount) - float(inv.insurance_amount),
        'due_date': inv.due_date.strftime('%Y-%m-%d'),
        'days_overdue': (today - inv.due_date).days
    } for inv in overdue_invoices], key=lambda x: x['days_overdue'], reverse=True)

    thirty_days_ago = today - timedelta(days=30)
    daily_collections = Invoice.objects.filter(
        created_at__date__gte=thirty_days_ago
    ).values('created_at__date').annotate(
        total=Sum('paid_amount'),
        count=Count('id')
    ).order_by('created_at__date')
    
    daily_collections_list = [{'date': item['created_at__date'].strftime('%Y-%m-%d'), 'total': float(item['total'] or 0.00), 'count': item['count']} for item in daily_collections]

    monthly_collections_list = []
    for i in range(6):
        month_date = today - timedelta(days=30 * i)
        m_start = month_date.replace(day=1)
        next_month = (m_start.replace(day=28) + timedelta(days=4))
        m_end = next_month - timedelta(days=next_month.day)
        m_collected = Invoice.objects.filter(
            created_at__date__range=[m_start, m_end]
        ).aggregate(total=Sum('paid_amount'))['total'] or 0.00
        monthly_collections_list.append({'month': m_start.strftime('%b %Y'), 'total': float(m_collected)})
    monthly_collections_list.reverse()

    channel_splits = Invoice.objects.values('payment_method').annotate(
        total=Sum('paid_amount'),
        count=Count('id')
    )
    channel_splits_list = [{'payment_method': item['payment_method'], 'total': float(item['total'] or 0.00), 'count': item['count']} for item in channel_splits if item['payment_method']]

    insurance_panel = Invoice.objects.filter(insurance_amount__gt=0).values('insurance_provider').annotate(
        total=Sum('insurance_amount'),
        count=Count('id')
    )
    insurance_panel_list = [{'insurance_provider': item['insurance_provider'], 'total': float(item['total'] or 0.00), 'count': item['count']} for item in insurance_panel if item['insurance_provider']]

    recent_invoices = Invoice.objects.select_related(
        'patient', 'patient__user', 'appointment', 'appointment__doctor', 'appointment__doctor__user'
    ).order_by('-created_at')[:50]
    
    ledger_list = [{
        'id': str(inv.id),
        'patient_name': inv.patient.user.full_name,
        'patient_mrn': inv.patient.mrn,
        'doctor_name': inv.appointment.doctor.user.full_name if inv.appointment else 'N/A',
        'amount': float(inv.amount),
        'paid_amount': float(inv.paid_amount),
        'insurance_amount': float(inv.insurance_amount),
        'insurance_provider': inv.insurance_provider,
        'due_date': inv.due_date.strftime('%Y-%m-%d') if inv.due_date else None,
        'payment_status': inv.payment_status,
        'payment_method': inv.payment_method,
        'created_at': inv.created_at.isoformat()
    } for inv in recent_invoices]

    return {
        'date_generated': today.strftime('%Y-%m-%d'),
        'aggregates': {
            'total_collected': float(total_collected),
            'patient_receivables': float(patient_receivables),
            'insurance_receivables': float(insurance_receivables),
            'total_overdue': float(total_overdue),
            'overdue_count': len(overdue_alerts)
        },
        'overdue_alerts': overdue_alerts,
        'daily_collections': daily_collections_list,
        'monthly_collections': monthly_collections_list,
        'channel_splits': channel_splits_list,
        'insurance_panel': insurance_panel_list,
        'ledger': ledger_list
    }

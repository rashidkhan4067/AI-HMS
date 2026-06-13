from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta

from applications.models import DoctorApplication
from applications.serializers import DoctorApplicationSerializer
from departments.models import Department
from invitations.models import StaffInvite
from accounts.permissions import IsAdminUser
from accounts.utils import send_doctor_application_update_email

class ApplyDoctorView(generics.CreateAPIView):
    queryset = DoctorApplication.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = DoctorApplicationSerializer
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Application submitted successfully.'},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminDoctorApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet to manage submitted Doctor Onboarding Applications. Restricted to Admin.
    """
    permission_classes = (IsAuthenticated, IsAdminUser)
    serializer_class = DoctorApplicationSerializer
    queryset = DoctorApplication.objects.all().order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='approve')
    def approve_application(self, request, pk=None):
        application = self.get_object()
        if application.status != 'PENDING':
            return Response({'detail': f'Application has already been {application.status.lower()}.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Update status
        application.status = 'APPROVED'
        application.save(update_fields=['status'])

        # 2. Check/Get department for Cardiology/etc or fallback
        # Let's map doctor specialization to department if exists, otherwise try Outpatient or first dept
        spec = application.specialization or ''
        dept = Department.objects.filter(name__icontains=spec).first()
        if not dept:
            dept = Department.objects.filter(name__icontains='Outpatient').first()
        if not dept:
            dept = Department.objects.first()

        # 3. Generate a StaffInvite automatically
        invite, created = StaffInvite.objects.get_or_create(
            email=application.email,
            defaults={
                'role': 'DOCTOR',
                'department': dept,
                'is_used': False
            }
        )
        if not created:
            invite.expires_at = timezone.now() + timedelta(days=7)
            invite.is_used = False
            invite.department = dept
            invite.role = 'DOCTOR'
            invite.save(update_fields=['expires_at', 'is_used', 'department', 'role'])

        # 4. Email the status update and invitation link
        try:
            send_doctor_application_update_email(
                email=application.email,
                full_name=application.full_name,
                status='APPROVED',
                invite_token=str(invite.id)
            )
            return Response({'detail': 'Application approved and onboarding invitation sent.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': f'Status updated but email dispatch failed: {str(e)}'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_application(self, request, pk=None):
        application = self.get_object()
        if application.status != 'PENDING':
            return Response({'detail': f'Application has already been {application.status.lower()}.'}, status=status.HTTP_400_BAD_REQUEST)

        message = request.data.get('message', 'Credentials verification could not be validated.').strip()

        # Update status
        application.status = 'REJECTED'
        application.rejection_reason = message
        application.save(update_fields=['status', 'rejection_reason'])

        # Email applicant
        try:
            send_doctor_application_update_email(
                email=application.email,
                full_name=application.full_name,
                status='REJECTED',
                message=message
            )
            return Response({'detail': 'Application rejected and applicant notified.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': f'Status updated but email dispatch failed: {str(e)}'}, status=status.HTTP_200_OK)

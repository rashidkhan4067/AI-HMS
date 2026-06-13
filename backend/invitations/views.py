from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta

from invitations.models import StaffInvite
from invitations.serializers import StaffInviteSerializer
from accounts.permissions import IsAdminUser
from accounts.utils import send_staff_invite_email

class ValidateInviteView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        token = request.data.get('token', '').strip()
        if not token:
            return Response(
                {'valid': False, 'detail': 'Token parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            invite = StaffInvite.objects.get(id=token)
        except (StaffInvite.DoesNotExist, ValueError):
            return Response(
                {'valid': False, 'detail': 'Invalid or expired invitation token.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not invite.is_valid():
            return Response(
                {'valid': False, 'detail': 'This invitation has expired or has already been used.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        role_labels = {
            'ADMIN': 'Administrator',
            'DOCTOR': 'Doctor / Clinician',
            'NURSE': 'Clinical Nurse',
            'RECEPTIONIST': 'Receptionist',
            'PHARMACIST': 'Pharmacist',
            'LAB_TECHNICIAN': 'Lab Technician',
            'RADIOLOGIST': 'Radiologist',
            'PATIENT': 'Patient',
        }

        return Response({
            'valid': True,
            'email': invite.email,
            'role': invite.role,
            'role_label': role_labels.get(invite.role, invite.role),
            'department_id': str(invite.department.id) if invite.department else None,
            'department_name': invite.department.name if invite.department else None,
        }, status=status.HTTP_200_OK)

class AdminInviteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing staff onboarding invitations. Restricted to Admin.
    """
    permission_classes = (IsAuthenticated, IsAdminUser)
    serializer_class = StaffInviteSerializer
    queryset = StaffInvite.objects.select_related('department').all().order_by('-created_at')

    def perform_create(self, serializer):
        invite = serializer.save()
        dept_name = invite.department.name if invite.department else None
        # Dispatch the invitation email
        send_staff_invite_email(invite.email, invite.role, dept_name, str(invite.id))

    @action(detail=True, methods=['post'], url_path='resend')
    def resend_invite(self, request, pk=None):
        invite = self.get_object()
        if invite.is_used:
            return Response({'detail': 'This invitation token has already been consumed.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Extend the expiry date to 7 days from now
        invite.expires_at = timezone.now() + timedelta(days=7)
        invite.save(update_fields=['expires_at'])

        dept_name = invite.department.name if invite.department else None
        # Re-send the email
        try:
            send_staff_invite_email(invite.email, invite.role, dept_name, str(invite.id))
            return Response({'detail': 'Invitation link resent successfully.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': f'SMTP Email Error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

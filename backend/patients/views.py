from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.conf import settings

from patients.models import Patient
from patients.serializers import PatientProfileSerializer, RegisterPatientSerializer
from accounts.models import LoginAuditLog
from accounts.serializers import UserSerializer
from accounts.permissions import IsClinicalStaff

User = get_user_model()

class RegisterPatientView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterPatientSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            from accounts.services import log_login_attempt, generate_auth_tokens, set_jwt_cookies
            
            log_login_attempt(user.email, request.META.get('REMOTE_ADDR'), 'PASSWORD', True, user)
            tokens = generate_auth_tokens(user)

            response = Response({
                "access": tokens['access'],
                "must_complete_profile": False,
                "redirect_to": "/patient/dashboard",
                "user": UserSerializer(user, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)

            return set_jwt_cookies(response, tokens['refresh'])
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PatientViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Patient.objects.all().select_related('user', 'user__department')
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated, IsClinicalStaff]

    def get_queryset(self):
        qs = super().get_queryset()
        mrn = self.request.query_params.get('mrn')
        name = self.request.query_params.get('name')
        if mrn:
            qs = qs.filter(mrn__iexact=mrn)
        if name:
            qs = qs.filter(user__full_name__icontains=name)
        return qs

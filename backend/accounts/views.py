import logging
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from accounts.models import PasswordResetOTP
from accounts.serializers import (
    RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer, VerifyOtpSerializer,
    ResetPasswordSerializer, CompleteProfileSerializer, RegisterInvitedSerializer
)
from accounts.services import generate_auth_tokens, log_login_attempt, handle_failed_login, set_jwt_cookies
from accounts.utils import send_otp_email, send_password_changed_email

User = get_user_model()
logger = logging.getLogger(__name__)

def _safe_department_name(user):
    """Safely get department name, returning None if the FK is dangling."""
    if not user.department_id: return None
    try: return user.department.name
    except Exception: return None

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        admin_emails = list(User.objects.filter(role='ADMIN', is_active=True).values_list('email', flat=True))
        if admin_emails:
            try:
                from django.core.mail import send_mail
                send_mail(
                    subject='[AI-HMS] New Registration Pending Approval',
                    message=f"A new user has registered and is awaiting activation.\n\nName: {user.full_name}\nEmail: {user.email}\nRole: {user.role}\n\nPlease log in to the admin panel to review and activate this account.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=admin_emails,
                    fail_silently=True,
                )
            except Exception:
                pass

class RegisterInvitedView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterInvitedSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Account created successfully.'}, status=status.HTTP_201_CREATED)

@method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=False), name='post')
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        return x_forwarded_for.split(',')[0].strip() if x_forwarded_for else request.META.get('REMOTE_ADDR')

    def post(self, request, *args, **kwargs):
        ip = self.get_client_ip(request)
        email = request.data.get('email', '').lower().strip()

        if getattr(request, 'limited', False):
            log_login_attempt(email, ip, 'PASSWORD', False, failure_reason='Rate limit exceeded')
            return Response({'error': 'rate_limit_exceeded', 'detail': 'Too many login attempts. Please wait a minute.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        user = User.objects.filter(email=email).first()

        if user and user.locked_until and user.locked_until > timezone.now():
            log_login_attempt(email, ip, 'PASSWORD', False, user, 'Account is locked due to too many failed attempts')
            return Response({
                'error': 'account_locked',
                'detail': 'Account is temporarily locked due to too many failed attempts.',
                'locked_until': user.locked_until.isoformat(),
            }, status=status.HTTP_423_LOCKED)

        try:
            response = super().post(request, *args, **kwargs)
        except Exception as e:
            handle_failed_login(user, email, ip, "PASSWORD")
            raise e

        if response.status_code == 200:
            refresh_token = response.data.pop('refresh', None)
            if refresh_token:
                response = set_jwt_cookies(response, refresh_token)

            if user:
                user.failed_attempts = 0
                user.locked_until = None
                user.last_login_ip = ip
                user.last_login_at = timezone.now()
                user.save(update_fields=['failed_attempts', 'locked_until', 'last_login_ip', 'last_login_at'])

                role_redirect_map = {
                    'ADMIN': '/admin/dashboard', 'DOCTOR': '/doctor/dashboard', 'NURSE': '/nurse/dashboard',
                    'RECEPTIONIST': '/reception/dashboard', 'PHARMACIST': '/pharmacy/dashboard',
                    'LAB_TECHNICIAN': '/lab/dashboard', 'RADIOLOGIST': '/radiology/dashboard',
                }
                response.data['redirect_to'] = role_redirect_map.get(user.role, '/dashboard')
                response.data['user'] = UserSerializer(user, context={'request': request}).data

            log_login_attempt(email, ip, 'PASSWORD', True, user)
            logger.info(f'Successful password login for {email} from {ip}')
        else:
            handle_failed_login(user, email, ip, "PASSWORD")

        return response

@method_decorator(ratelimit(key='ip', rate='20/m', method='POST', block=False), name='post')
class CheckEmailView(generics.GenericAPIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        if getattr(request, 'limited', False):
            return Response({'error': 'rate_limit_exceeded', 'detail': 'Too many requests. Please slow down.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        email = request.data.get('email', '').lower().strip()
        if not email:
            return Response({'exists': False})

        user = User.objects.filter(email=email, is_active=True).first()
        if not user:
            return Response({'exists': False})

        return Response({
            'exists': True,
            'first_name': user.full_name.split()[0] if user.full_name else '',
            'role_label': user.get_role_display(),
            'role': user.role,
            'department': _safe_department_name(user),
        })

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid(raise_exception=True):
            if not self.object.check_password(serializer.validated_data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)

            self.object.set_password(serializer.validated_data.get("new_password"))
            self.object.save()

            try: send_password_changed_email(self.object)
            except Exception: pass

            return Response({"detail": "Password updated successfully"}, status=status.HTTP_200_OK)

class CompleteProfileView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CompleteProfileSerializer

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.department = serializer.validated_data['department']
        
        if employee_id := serializer.validated_data.get('employee_id'):
            user.employee_id = employee_id
        if phone := serializer.validated_data.get('phone'):
            user.phone = phone

        user.must_complete_profile = False
        user.save(update_fields=['department', 'employee_id', 'phone', 'must_complete_profile'])

        tokens = generate_auth_tokens(user)
        response = Response({'detail': 'Profile completed successfully.', 'access': tokens['access']}, status=status.HTTP_200_OK)
        return set_jwt_cookies(response, tokens['refresh'])

class ForgotPasswordView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ForgotPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        if not User.objects.filter(email=email).exists():
            return Response({"detail": "No account is registered with this email address."}, status=status.HTTP_400_BAD_REQUEST)

        PasswordResetOTP.objects.filter(email=email, is_used=False).update(is_used=True)
        otp_record = PasswordResetOTP.objects.create(email=email)

        try:
            send_otp_email(email, otp_record.otp)
            logger.info(f'OTP email dispatched to {email}')
        except Exception as exc:
            logger.exception(f'Failed to send OTP email to {email}: {exc}')

        return Response({"message": "A password reset code has been sent to your email address.", "email": email}, status=status.HTTP_200_OK)

class VerifyOtpView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = VerifyOtpSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        otp_record = serializer.validated_data['otp_record']
        otp_record.is_used = True
        otp_record.save(update_fields=['is_used'])

        return Response({"message": "OTP verified successfully.", "token": otp_record.pk}, status=status.HTTP_200_OK)

class ResetPasswordView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ResetPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        user.set_password(serializer.validated_data['password'])
        user.save(update_fields=['password'])

        try: send_password_changed_email(user)
        except Exception: pass

        PasswordResetOTP.objects.filter(email=user.email).delete()
        return Response({"message": "Password reset successfully. You can now sign in with your new credentials."}, status=status.HTTP_200_OK)

@method_decorator(ratelimit(key='ip', rate='10/m', method='POST', block=False), name='post')
class GoogleLoginView(APIView):
    permission_classes = (AllowAny,)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        return x_forwarded_for.split(',')[0].strip() if x_forwarded_for else request.META.get('REMOTE_ADDR')

    def post(self, request, *args, **kwargs):
        ip = self.get_client_ip(request)
        if getattr(request, 'limited', False):
            log_login_attempt("", ip, "GOOGLE", False, failure_reason="Rate limit exceeded")
            return Response({"error": "rate_limit_exceeded"}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        token = request.data.get('id_token') or request.data.get('access_token')
        if not token:
            log_login_attempt("", ip, "GOOGLE", False, failure_reason="Missing token")
            return Response({'error': 'id_token_required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            try:
                idinfo = google_id_token.verify_oauth2_token(token, google_requests.Request(), settings.GOOGLE_CLIENT_ID)
                if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                    raise ValueError('Invalid token issuer.')
                if not idinfo.get('email_verified'):
                    raise ValueError('Email not verified by Google.')
                email, sub = idinfo.get('email'), idinfo.get('sub')
            except ValueError as val_err:
                import requests
                resp = requests.get(f"https://oauth2.googleapis.com/tokeninfo?access_token={token}")
                if resp.status_code != 200: raise ValueError(f"Invalid access token: {resp.text}") from val_err
                info = resp.json()
                if (info.get('aud') or info.get('audience')) != settings.GOOGLE_CLIENT_ID and info.get('issued_to') != settings.GOOGLE_CLIENT_ID:
                    raise ValueError("Token client ID mismatch.") from val_err
                if str(info.get('email_verified') or info.get('verified_email')).lower() != 'true':
                    raise ValueError("Email not verified by Google.") from val_err
                email, sub = info.get('email'), info.get('sub') or info.get('user_id')
        except Exception as e:
            log_login_attempt("", ip, "GOOGLE", False, failure_reason=f"Token verification failed: {str(e)}")
            return Response({'error': 'invalid_token', 'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if not user:
            log_login_attempt(email, ip, "GOOGLE", False, failure_reason="User not registered")
            return Response({"error": "not_registered"}, status=status.HTTP_403_FORBIDDEN)

        if user.locked_until and user.locked_until > timezone.now():
            log_login_attempt(email, ip, "GOOGLE", False, user, "Account is locked")
            return Response({"error": "account_locked", "locked_until": user.locked_until.isoformat()}, status=status.HTTP_423_LOCKED)

        if not user.is_active:
            log_login_attempt(email, ip, "GOOGLE", False, user, "Account is inactive")
            return Response({"error": "inactive_account"}, status=status.HTTP_403_FORBIDDEN)

        if not user.google_sub:
            user.google_sub = sub
            user.is_google_user = True
            user.must_complete_profile = True
            user.save(update_fields=['google_sub', 'is_google_user', 'must_complete_profile'])

        tokens = generate_auth_tokens(user)
        log_login_attempt(email, ip, "GOOGLE", True, user)

        role_redirect_map = {
            'ADMIN': '/admin/dashboard', 'DOCTOR': '/doctor/dashboard', 'NURSE': '/nurse/dashboard',
            'RECEPTIONIST': '/reception/dashboard', 'PHARMACIST': '/pharmacy/dashboard',
            'LAB_TECHNICIAN': '/lab/dashboard', 'RADIOLOGIST': '/radiology/dashboard',
        }

        response = Response({
            "access": tokens['access'],
            "must_complete_profile": user.must_complete_profile,
            "redirect_to": role_redirect_map.get(user.role, '/dashboard'),
            "user": UserSerializer(user, context={'request': request}).data
        }, status=status.HTTP_200_OK)

        return set_jwt_cookies(response, tokens['refresh'])

class CustomTokenRefreshView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({"error": "refresh_token_missing"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            token = RefreshToken(refresh_token)
            user = User.objects.get(id=token.payload.get('user_id'))
            token.blacklist()
            
            tokens = generate_auth_tokens(user)
        except (TokenError, InvalidToken, User.DoesNotExist) as e:
            return Response({"error": "invalid_refresh_token", "detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        response = Response({"access": tokens['access']}, status=status.HTTP_200_OK)
        return set_jwt_cookies(response, tokens['refresh'])

class CustomLogoutView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        if refresh_token := request.COOKIES.get('refresh_token'):
            try: RefreshToken(refresh_token).blacklist()
            except Exception: pass
                
        response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        for path in ["/api/v1/auth/", "/api/auth/", "/"]:
            response.delete_cookie("refresh_token", path=path)
        return response

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import logging
from django.core.mail import send_mail
from django.conf import settings
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    VerifyOtpSerializer,
    ResetPasswordSerializer,
    CompleteProfileSerializer,
    DepartmentSerializer,
    DoctorApplicationSerializer,
    RegisterInvitedSerializer,
    RegisterPatientSerializer,
)
from .models import PasswordResetOTP, Department, LoginAuditLog, StaffInvite, DoctorApplication

from django.utils import timezone
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit

User = get_user_model()


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


from rest_framework.parsers import MultiPartParser, FormParser

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


# ── Existing Views ────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        # Notify all active ADMIN users about the pending registration
        admin_emails = list(
            User.objects.filter(role='ADMIN', is_active=True)
            .values_list('email', flat=True)
        )
        if admin_emails:
            try:
                from django.core.mail import send_mail
                from django.conf import settings as dj_settings
                send_mail(
                    subject='[AI-HMS] New Registration Pending Approval',
                    message=(
                        f"A new user has registered and is awaiting activation.\n\n"
                        f"Name: {user.full_name}\n"
                        f"Email: {user.email}\n"
                        f"Role: {user.role}\n\n"
                        f"Please log in to the admin panel to review and activate this account."
                    ),
                    from_email=dj_settings.DEFAULT_FROM_EMAIL,
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
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Account created successfully.'},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterPatientView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterPatientSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Write a successful LoginAuditLog entry
            LoginAuditLog.objects.create(
                user=user,
                email_attempted=user.email,
                ip_address=request.META.get('REMOTE_ADDR'),
                login_method="PASSWORD",
                success=True
            )

            # Generate tokens
            refresh = RefreshToken.for_user(user)
            refresh['role'] = user.role
            refresh['full_name'] = user.full_name
            refresh['department'] = None
            refresh['must_complete_profile'] = False

            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            response = Response({
                "access": access_token,
                "must_complete_profile": False,
                "redirect_to": "/patient/dashboard",
                "user": UserSerializer(user, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)

            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                samesite='Strict',
                secure=not settings.DEBUG,
                max_age=7 * 24 * 60 * 60
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=False), name='post')
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

    def post(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)

        ip = self.get_client_ip(request)
        email = request.data.get('email', '').lower().strip()

        # ── 1. Rate limit check ──────────────────────────────────────────────
        if getattr(request, 'limited', False):
            LoginAuditLog.objects.create(
                user=None,
                email_attempted=email,
                ip_address=ip,
                login_method='PASSWORD',
                success=False,
                failure_reason='Rate limit exceeded (5 requests per minute)',
            )
            return Response(
                {'error': 'rate_limit_exceeded', 'detail': 'Too many login attempts. Please wait a minute.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        # ── 2. Lookup user & check server-side lockout ───────────────────────
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            user = None

        if user and user.locked_until and user.locked_until > timezone.now():
            LoginAuditLog.objects.create(
                user=user,
                email_attempted=email,
                ip_address=ip,
                login_method='PASSWORD',
                success=False,
                failure_reason='Account is locked due to too many failed attempts',
            )
            return Response(
                {
                    'error': 'account_locked',
                    'detail': 'Account is temporarily locked due to too many failed attempts.',
                    'locked_until': user.locked_until.isoformat(),
                },
                status=status.HTTP_423_LOCKED,
            )

        # ── 3. Attempt authentication via SimpleJWT ──────────────────────────
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            # Success — reset counters, update audit fields
            if user:
                user.failed_attempts = 0
                user.locked_until = None
                user.last_login_ip = ip
                user.last_login_at = timezone.now()
                user.save(update_fields=['failed_attempts', 'locked_until', 'last_login_ip', 'last_login_at'])

                role_redirect_map = {
                    'ADMIN': '/admin/dashboard',
                    'DOCTOR': '/doctor/dashboard',
                    'NURSE': '/nurse/dashboard',
                    'RECEPTIONIST': '/reception/dashboard',
                    'PHARMACIST': '/pharmacy/dashboard',
                    'LAB_TECHNICIAN': '/lab/dashboard',
                    'RADIOLOGIST': '/radiology/dashboard',
                }
                response.data['redirect_to'] = role_redirect_map.get(user.role, '/dashboard')
                response.data['user'] = UserSerializer(user, context={'request': request}).data

            LoginAuditLog.objects.create(
                user=user,
                email_attempted=email,
                ip_address=ip,
                login_method='PASSWORD',
                success=True,
            )
            logger.info(f'Successful password login for {email} from {ip}')
        else:
            # Failure — increment counter, lock if threshold hit
            MAX_ATTEMPTS = 5
            LOCKOUT_MINUTES = 15
            if user:
                user.failed_attempts += 1
                if user.failed_attempts >= MAX_ATTEMPTS:
                    from datetime import timedelta
                    user.locked_until = timezone.now() + timedelta(minutes=LOCKOUT_MINUTES)
                    failure_reason = f'Account locked after {MAX_ATTEMPTS} failed attempts'
                else:
                    failure_reason = f'Invalid credentials (attempt {user.failed_attempts}/{MAX_ATTEMPTS})'
                user.save(update_fields=['failed_attempts', 'locked_until'])
            else:
                failure_reason = 'No account found with this email'

            LoginAuditLog.objects.create(
                user=user,
                email_attempted=email,
                ip_address=ip,
                login_method='PASSWORD',
                success=False,
                failure_reason=failure_reason,
            )
            logger.warning(f'Failed password login for {email} from {ip}: {failure_reason}')

        return response


# ── Check Email ───────────────────────────────────────────────────────────────

@method_decorator(ratelimit(key='ip', rate='20/m', method='POST', block=False), name='post')
class CheckEmailView(generics.GenericAPIView):
    """
    POST /api/auth/check-email/
    Accepts {"email": "..."} and returns whether an active account exists.

    Security rules:
    - Non-existent accounts → {"exists": false}
    - Inactive (pending approval) accounts → {"exists": false}
      (do NOT reveal that an inactive account exists — prevents enumeration)
    - Active accounts → {"exists": true, "first_name": ..., "role_label": ..., "department": ...}
    - Rate limited to 20 requests/minute per IP.
    """
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        # ── Rate limit guard ────────────────────────────────────────────────
        if getattr(request, 'limited', False):
            return Response(
                {'error': 'rate_limit_exceeded', 'detail': 'Too many requests. Please slow down.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        email = request.data.get('email', '').lower().strip()
        if not email:
            return Response({'exists': False})

        # ── Lookup — only reveal active accounts ────────────────────────────
        user = User.objects.filter(email=email, is_active=True).first()

        if not user:
            # Covers both "no account" and "account pending approval" —
            # client gets the same response in both cases.
            return Response({'exists': False})

        return Response({
            'exists':     True,
            'first_name': user.full_name.split()[0] if user.full_name else '',
            'role_label': user.get_role_display(),
            'role':       user.role,
            'department': user.department.name if user.department else None,
        })


# ── User Profile ──────────────────────────────────────────────────────────────

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        # Always return the currently authenticated user
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    model = User
    permission_classes = (IsAuthenticated,)

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)

            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()

            # Send security notification email
            try:
                from .utils import send_password_changed_email
                send_password_changed_email(self.object)
            except Exception:
                pass

            return Response({"detail": "Password updated successfully"}, status=status.HTTP_200_OK)


        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"detail": "Invalid token or token is already blacklisted."}, status=status.HTTP_400_BAD_REQUEST)


# ── Profile Completion ───────────────────────────────────────────────────────

class DepartmentListView(generics.ListAPIView):
    """
    GET /auth/departments/
    Returns all available departments for the profile completion dropdown.
    """
    permission_classes = (AllowAny,)
    serializer_class = DepartmentSerializer
    queryset = Department.objects.all().order_by('name')


class CompleteProfileView(generics.GenericAPIView):
    """
    PATCH /auth/complete-profile/
    Body: { "department": "<uuid>", "employee_id": "...", "phone": "..." }

    Completes the profile for a Google SSO user, sets must_complete_profile = False,
    and returns a fresh JWT pair.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = CompleteProfileSerializer

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.department = serializer.validated_data['department']

        employee_id = serializer.validated_data.get('employee_id')
        phone = serializer.validated_data.get('phone')
        if employee_id:
            user.employee_id = employee_id
        if phone:
            user.phone = phone

        user.must_complete_profile = False
        user.save(update_fields=['department', 'employee_id', 'phone', 'must_complete_profile'])

        # Issue fresh tokens so must_complete_profile claim is updated
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['full_name'] = user.full_name
        refresh['department'] = str(user.department.id) if user.department else None
        refresh['must_complete_profile'] = False

        new_access = str(refresh.access_token)
        new_refresh = str(refresh)

        response = Response({
            'detail': 'Profile completed successfully.',
            'access': new_access,
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key='refresh_token',
            value=new_refresh,
            httponly=True,
            samesite='Strict',
            secure=not settings.DEBUG,
            max_age=7 * 24 * 60 * 60
        )
        return response


# ── Password Reset Flow ───────────────────────────────────────────────────────

class ForgotPasswordView(generics.GenericAPIView):
    """
    POST /auth/forgot-password/
    Body: { "email": "user@example.com" }

    Generates a 6-digit OTP and emails it.
    Always returns 200 even if the email is not registered (prevents user enumeration).
    """
    permission_classes = (AllowAny,)
    serializer_class = ForgotPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        # Check if the user exists
        if not User.objects.filter(email=email).exists():
            return Response(
                {"detail": "No account is registered with this email address."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Invalidate any previous unused OTPs for this email
        PasswordResetOTP.objects.filter(email=email, is_used=False).update(is_used=True)

        # Create a fresh OTP record (otp + expires_at auto-set in model.save)
        otp_record = PasswordResetOTP.objects.create(email=email)

        # Send email — log errors
        logger = logging.getLogger(__name__)
        try:
            from .utils import send_otp_email
            send_otp_email(email, otp_record.otp)
            logger.info(f'OTP email dispatched to {email}')
        except Exception as exc:
            logger.exception(f'Failed to send OTP email to {email}: {exc}')
            # OTP is still in the DB so staff can look it up in Admin if needed

        return Response(
            {
                "message": "A password reset code has been sent to your email address.",
                "email": email,
            },
            status=status.HTTP_200_OK,
        )


class VerifyOtpView(generics.GenericAPIView):
    """
    POST /auth/verify-otp/
    Body: { "email": "user@example.com", "otp": "123456" }

    Validates the OTP, marks it as used, and returns the OTP record ID
    as a short-lived one-time token for the reset-password step.
    """
    permission_classes = (AllowAny,)
    serializer_class = VerifyOtpSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        otp_record = serializer.validated_data['otp_record']

        # Mark the OTP as used (consumed, cannot be reused)
        otp_record.is_used = True
        otp_record.save(update_fields=['is_used'])

        return Response(
            {
                "message": "OTP verified successfully.",
                "token": otp_record.pk,   # Frontend sends this back in the reset step
            },
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(generics.GenericAPIView):
    """
    POST /auth/reset-password/
    Body: { "otp_record_id": <int>, "password": "...", "confirm_password": "..." }

    Sets a new password. The otp_record_id must correspond to a used (verified) OTP.
    """
    permission_classes = (AllowAny,)
    serializer_class = ResetPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        new_password = serializer.validated_data['password']

        user.set_password(new_password)
        user.save(update_fields=['password'])

        # Send security notification email
        try:
            from .utils import send_password_changed_email
            send_password_changed_email(user)
        except Exception:
            pass

        # Clean up all OTP records for this email (housekeeping)
        PasswordResetOTP.objects.filter(email=user.email).delete()

        return Response(
            {"message": "Password reset successfully. You can now sign in with your new credentials."},
            status=status.HTTP_200_OK,
        )


from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework.views import APIView
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from .models import LoginAuditLog

@method_decorator(ratelimit(key='ip', rate='10/m', method='POST', block=False), name='post')
class GoogleLoginView(APIView):
    permission_classes = (AllowAny,)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

    def post(self, request, *args, **kwargs):
        # 1. Rate Limiting Check
        ip = self.get_client_ip(request)
        if getattr(request, 'limited', False):
            LoginAuditLog.objects.create(
                user=None,
                email_attempted="",
                ip_address=ip,
                login_method="GOOGLE",
                success=False,
                failure_reason="Rate limit exceeded (10 requests per minute)"
            )
            return Response({"error": "rate_limit_exceeded"}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # 2. Extract and verify Google token
        token = request.data.get('id_token') or request.data.get('access_token')
        if not token:
            LoginAuditLog.objects.create(
                user=None,
                email_attempted="",
                ip_address=ip,
                login_method="GOOGLE",
                success=False,
                failure_reason="Missing token (id_token or access_token required)"
            )
            return Response({'error': 'id_token_required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            try:
                # Verify via google-auth library (expects JWT ID Token)
                idinfo = google_id_token.verify_oauth2_token(
                    token,
                    google_requests.Request(),
                    settings.GOOGLE_CLIENT_ID
                )

                # Validate iss (issuer)
                if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                    raise ValueError('Invalid token issuer.')

                # Validate email_verified
                if not idinfo.get('email_verified'):
                    raise ValueError('Email not verified by Google.')

                email = idinfo.get('email')
                sub = idinfo.get('sub')
            except ValueError as val_err:
                # Fall back to verifying access_token via Google's tokeninfo API
                import requests
                resp = requests.get(f"https://oauth2.googleapis.com/tokeninfo?access_token={token}")
                if resp.status_code != 200:
                    raise ValueError(f"Invalid access token or token expired: {resp.text}") from val_err
                info = resp.json()
                aud = info.get('aud') or info.get('audience')
                if aud != settings.GOOGLE_CLIENT_ID and info.get('issued_to') != settings.GOOGLE_CLIENT_ID:
                    raise ValueError("Token client ID mismatch.") from val_err
                email_verified = info.get('email_verified') or info.get('verified_email')
                if str(email_verified).lower() != 'true':
                    raise ValueError("Email not verified by Google.") from val_err
                email = info.get('email')
                sub = info.get('sub') or info.get('user_id')
        except Exception as e:
            LoginAuditLog.objects.create(
                user=None,
                email_attempted="",
                ip_address=ip,
                login_method="GOOGLE",
                success=False,
                failure_reason=f"Token verification failed: {str(e)}"
            )
            return Response({'error': 'invalid_token', 'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Check if email exists in HMSUser
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            LoginAuditLog.objects.create(
                user=None,
                email_attempted=email,
                ip_address=ip,
                login_method="GOOGLE",
                success=False,
                failure_reason="User not registered"
            )
            return Response({"error": "not_registered"}, status=status.HTTP_403_FORBIDDEN)

        # 4. Check is_active and locked_until status
        if user.locked_until and user.locked_until > timezone.now():
            LoginAuditLog.objects.create(
                user=user,
                email_attempted=email,
                ip_address=ip,
                login_method="GOOGLE",
                success=False,
                failure_reason="Account is locked"
            )
            return Response({
                "error": "account_locked",
                "locked_until": user.locked_until.isoformat()
            }, status=status.HTTP_423_LOCKED)

        if not user.is_active:
            LoginAuditLog.objects.create(
                user=user,
                email_attempted=email,
                ip_address=ip,
                login_method="GOOGLE",
                success=False,
                failure_reason="Account is inactive"
            )
            return Response({"error": "inactive_account"}, status=status.HTTP_403_FORBIDDEN)

        # 5. Link Google profile if google_sub is null
        if not user.google_sub:
            user.google_sub = sub
            user.is_google_user = True
            user.must_complete_profile = True
            user.save(update_fields=['google_sub', 'is_google_user', 'must_complete_profile'])

        # 6. Issue custom SimpleJWT tokens
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['full_name'] = user.full_name
        refresh['department'] = str(user.department.id) if user.department else None
        refresh['must_complete_profile'] = user.must_complete_profile

        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Write successful LoginAuditLog entry
        LoginAuditLog.objects.create(
            user=user,
            email_attempted=email,
            ip_address=ip,
            login_method="GOOGLE",
            success=True
        )

        role_redirect_map = {
            'ADMIN': '/admin/dashboard',
            'DOCTOR': '/doctor/dashboard',
            'NURSE': '/nurse/dashboard',
            'RECEPTIONIST': '/reception/dashboard',
            'PHARMACIST': '/pharmacy/dashboard',
            'LAB_TECHNICIAN': '/lab/dashboard',
            'RADIOLOGIST': '/radiology/dashboard',
        }

        # 7. Return access token and set refresh token as httpOnly SameSite=Strict cookie
        response = Response({
            "access": access_token,
            "must_complete_profile": user.must_complete_profile,
            "redirect_to": role_redirect_map.get(user.role, '/dashboard'),
            "user": UserSerializer(user, context={'request': request}).data
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            samesite='Strict',
            secure=not settings.DEBUG,
            max_age=7 * 24 * 60 * 60 # 7 days
        )

        return response


from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class CustomTokenRefreshView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({"error": "refresh_token_missing"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            token = RefreshToken(refresh_token)
            user_id = token.payload.get('user_id')
            user = User.objects.get(id=user_id)
            
            # Blacklist the old token
            token.blacklist()
            
            # Rotate refresh token
            new_refresh = RefreshToken.for_user(user)
            new_refresh['role'] = user.role
            new_refresh['full_name'] = user.full_name
            new_refresh['department'] = str(user.department.id) if user.department else None
            new_refresh['must_complete_profile'] = user.must_complete_profile
            
            new_access_token = str(new_refresh.access_token)
            new_refresh_token = str(new_refresh)
        except (TokenError, InvalidToken, User.DoesNotExist) as e:
            return Response({"error": "invalid_refresh_token", "detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        response = Response({
            "access": new_access_token
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key='refresh_token',
            value=new_refresh_token,
            httponly=True,
            samesite='Strict',
            secure=not settings.DEBUG,
            max_age=7 * 24 * 60 * 60 # 7 days
        )
        return response

class CustomLogoutView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
                
        response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        # Clear the cookie from paths
        response.delete_cookie("refresh_token", path="/api/v1/auth/")
        response.delete_cookie("refresh_token", path="/api/auth/")
        response.delete_cookie("refresh_token", path="/")
        return response




from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    UserProfileView,
    ChangePasswordView,
    ForgotPasswordView,
    VerifyOtpView,
    ResetPasswordView,
    GoogleLoginView,
    CustomTokenRefreshView,
    CustomLogoutView,
    CompleteProfileView,
    DepartmentListView,
    CheckEmailView,
    ValidateInviteView,
    ApplyDoctorView,
    RegisterInvitedView,
    RegisterPatientView,
    PatientViewSet,
    DoctorViewSet,
    DoctorAvailabilityViewSet,
    AppointmentViewSet,
)
from .admin_views import (
    AdminOverviewView,
    AdminInviteViewSet,
    AdminDoctorApplicationViewSet,
    AdminUserViewSet,
    AdminAuditLogListView,
    AdminDashboardDataView,
    AdminSystemHealthView,
)

router = DefaultRouter()
router.register(r'admin/invites', AdminInviteViewSet, basename='admin_invite')
router.register(r'admin/applications', AdminDoctorApplicationViewSet, basename='admin_application')
router.register(r'admin/users', AdminUserViewSet, basename='admin_user')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'doctor-availabilities', DoctorAvailabilityViewSet, basename='doctor_availability')
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('register-invited/', RegisterInvitedView.as_view(), name='register_invited'),
    path('register-patient/', RegisterPatientView.as_view(), name='register_patient'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('google/', GoogleLoginView.as_view(), name='google_login'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh_custom'),
    path('me/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('logout/', CustomLogoutView.as_view(), name='logout'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('verify-otp/', VerifyOtpView.as_view(), name='verify_otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('complete-profile/', CompleteProfileView.as_view(), name='complete_profile'),
    path('departments/', DepartmentListView.as_view(), name='departments'),
    path('check-email/', CheckEmailView.as_view(), name='check_email'),
    path('validate-invite/', ValidateInviteView.as_view(), name='validate_invite'),
    path('apply-doctor/', ApplyDoctorView.as_view(), name='apply_doctor'),
    
    # Admin Specific Views
    path('admin/dashboard-data/', AdminDashboardDataView.as_view(), name='admin_dashboard_data'),
    path('admin/overview/', AdminOverviewView.as_view(), name='admin_overview'),
    path('admin/audits/', AdminAuditLogListView.as_view(), name='admin_audits'),
    path('admin/health-check/', AdminSystemHealthView.as_view(), name='admin_health_check'),
    path('', include(router.urls)),
]

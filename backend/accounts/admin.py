from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import HMSUser, Department, LoginAuditLog, PasswordResetOTP


# ── Department ────────────────────────────────────────────────────────────────

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display  = ('name', 'description')
    search_fields = ('name',)
    ordering      = ('name',)


# ── HMSUser ───────────────────────────────────────────────────────────────────

@admin.register(HMSUser)
class HMSUserAdmin(BaseUserAdmin):
    ordering         = ('-created_at',)
    list_display     = ('email', 'full_name', 'role', 'department', 'is_active', 'is_google_user', 'created_at')
    list_filter      = ('role', 'is_active', 'is_google_user', 'department')
    search_fields    = ('email', 'full_name', 'employee_id')
    readonly_fields  = ('id', 'created_at', 'last_login', 'google_sub', 'must_complete_profile')

    fieldsets = (
        ('Identity',  {'fields': ('id', 'email', 'full_name', 'role', 'department', 'employee_id', 'phone')}),
        ('Password',  {'fields': ('password',)}),
        ('Google SSO', {'fields': ('is_google_user', 'google_sub', 'must_complete_profile')}),
        ('Status',    {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Security',  {'fields': ('failed_attempts', 'locked_until', 'last_login_ip', 'last_login_at')}),
        ('Timestamps', {'fields': ('created_at', 'last_login')}),
        ('Permissions', {'fields': ('groups', 'user_permissions')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'full_name', 'role', 'password1', 'password2', 'is_active'),
        }),
    )


# ── Login Audit Log ───────────────────────────────────────────────────────────

@admin.register(LoginAuditLog)
class LoginAuditLogAdmin(admin.ModelAdmin):
    """
    Read-only audit trail of every login attempt — success, failure, and lockout.
    All fields are immutable; no one can alter the security paper trail.
    """

    # ── List view ──────────────────────────────────────────────────────────────
    list_display   = (
        'email_attempted',
        'colored_success',
        'login_method',
        'ip_address',
        'failure_reason',
        'timestamp',
    )
    list_filter    = ('success', 'login_method')
    search_fields  = ('email_attempted', 'ip_address')
    date_hierarchy = 'timestamp'
    ordering       = ('-timestamp',)
    list_per_page  = 50

    # ── Detail view ────────────────────────────────────────────────────────────
    readonly_fields = (
        'user',
        'email_attempted',
        'ip_address',
        'login_method',
        'success',
        'failure_reason',
        'timestamp',
    )

    fieldsets = (
        ('Attempt Details', {
            'fields': ('email_attempted', 'user', 'login_method', 'ip_address'),
        }),
        ('Outcome', {
            'fields': ('success', 'failure_reason'),
        }),
        ('Timestamp', {
            'fields': ('timestamp',),
        }),
    )

    # ── Disable all write operations ───────────────────────────────────────────
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    # ── Color-coded success column ─────────────────────────────────────────────
    @admin.display(description='Result', ordering='success')
    def colored_success(self, obj):
        if obj.success:
            return format_html(
                '<span style="color:#059669;font-weight:600;">&#10003; Success</span>'
            )
        return format_html(
            '<span style="color:#DC2626;font-weight:600;">&#10007; Failed</span>'
        )


# ── Password Reset OTP ────────────────────────────────────────────────────────

@admin.register(PasswordResetOTP)
class PasswordResetOTPAdmin(admin.ModelAdmin):
    list_display  = ('email', 'is_used', 'created_at', 'expires_at')
    list_filter   = ('is_used',)
    search_fields = ('email',)
    ordering      = ('-created_at',)
    readonly_fields = ('email', 'otp', 'created_at', 'expires_at', 'is_used')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

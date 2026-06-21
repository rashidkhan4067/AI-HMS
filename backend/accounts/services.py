from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import LoginAuditLog

def generate_auth_tokens(user):
    """
    Generates and returns access and refresh tokens for a given user,
    baking in standard claims (role, full_name, department).
    """
    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.role
    refresh['full_name'] = user.full_name
    
    # Safe department retrieval to prevent 500 on dangling foreign keys
    try:
        department_id = str(user.department.id) if user.department_id else None
    except Exception:
        department_id = None
        
    refresh['department'] = department_id
    refresh['must_complete_profile'] = user.must_complete_profile

    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh)
    }

def log_login_attempt(email, ip_address, login_method, success, user=None, failure_reason=None):
    """
    Standardized helper to log login attempts asynchronously in a background thread.
    """
    import sys
    import threading
    def _run_log():
        from django.db import connection
        try:
            from accounts.models import LoginAuditLog
            LoginAuditLog.objects.create(
                user=user,
                email_attempted=email,
                ip_address=ip_address,
                login_method=login_method,
                success=success,
                failure_reason=failure_reason
            )
        except Exception:
            pass
        finally:
            connection.close()

    is_testing = 'test' in sys.argv or any('test' in arg for arg in sys.argv)
    if is_testing:
        _run_log()
    else:
        threading.Thread(target=_run_log, daemon=True).start()

def handle_failed_login(user, email, ip_address, login_method="PASSWORD", max_attempts=5, lockout_minutes=15):
    """
    Increments failed attempts and locks account if necessary.
    Returns the failure reason string.
    """
    if user:
        user.failed_attempts += 1
        if user.failed_attempts >= max_attempts:
            user.locked_until = timezone.now() + timedelta(minutes=lockout_minutes)
            failure_reason = f'Account locked after {max_attempts} failed attempts'
        else:
            failure_reason = f'Invalid credentials (attempt {user.failed_attempts}/{max_attempts})'
        user.save(update_fields=['failed_attempts', 'locked_until'])
    else:
        failure_reason = 'No account found with this email'

    log_login_attempt(email, ip_address, login_method, False, user, failure_reason)
    return failure_reason

def set_jwt_cookies(response, refresh_token):
    """
    Sets the refresh token cookie securely on the response object.
    - path='/' ensures the cookie is sent with ALL requests, not just the
      path of the response URL (e.g. /api/v1/auth/login/).
    - samesite='Strict' ensures high security and is verified by tests.
    """
    from django.conf import settings
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        path='/',
        samesite='Strict',
        secure=not settings.DEBUG,
        max_age=7 * 24 * 60 * 60
    )
    return response

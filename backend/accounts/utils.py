import logging
import threading
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings

logger = logging.getLogger(__name__)


def _send_email_async(msg):
    """Helper to dispatch email. Avoids redundant thread creation if the custom
    asynchronous backend is configured, and ensures synchronous execution during testing."""
    backend_class = getattr(settings, 'EMAIL_BACKEND', '')
    
    # If the custom AsynchronousEmailBackend is configured, call msg.send() directly
    # since it will handle background dispatching at the backend level.
    # Also, if we are in testing (using locmem backend), send synchronously to populate mail.outbox.
    if (backend_class == 'accounts.email_backends.AsynchronousEmailBackend' or 
            backend_class == 'django.core.mail.backends.locmem.EmailBackend'):
        try:
            msg.send(fail_silently=False)
        except Exception as e:
            logger.error("Email dispatch failed: %s", e, exc_info=True)
    else:
        # Fallback to starting a raw thread for other synchronous backends
        def run_send():
            try:
                msg.send(fail_silently=False)
            except Exception as e:
                logger.error("Asynchronous email dispatch failed: %s", e, exc_info=True)

        thread = threading.Thread(target=run_send)
        thread.daemon = True
        thread.start()


def send_welcome_email(user):
    """Sends a styled welcome email to newly registered users asynchronously."""
    try:
        subject = 'Welcome to Al Shifaa Clinic!'
        context = {
            'first_name': user.full_name,
            'email': user.email,
            'role': user.role,
        }
        html_content = render_to_string('emails/welcome_email.html', context)
        text_content = strip_tags(html_content)

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        msg.attach_alternative(html_content, "text/html")
        _send_email_async(msg)
    except Exception as e:
        logger.error("Failed to construct welcome email to %s: %s", user.email, e, exc_info=True)


def send_otp_email(email, otp):
    """Sends a styled OTP verification email for password resets asynchronously."""
    try:
        subject = 'Al Shifaa HMS — Your Password Reset Code'
        context = {
            'otp': otp,
            'email': email,
        }
        html_content = render_to_string('emails/otp_email.html', context)
        text_content = strip_tags(html_content)

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email]
        )
        msg.attach_alternative(html_content, "text/html")
        _send_email_async(msg)
    except Exception as e:
        logger.error("Failed to construct OTP email to %s: %s", email, e, exc_info=True)


def send_password_changed_email(user):
    """Sends a security warning email when a user changes their password asynchronously."""
    try:
        subject = 'Al Shifaa HMS — Password Changed Notification'
        context = {
            'first_name': user.full_name,
            'email': user.email,
        }
        html_content = render_to_string('emails/password_changed_email.html', context)
        text_content = strip_tags(html_content)

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        msg.attach_alternative(html_content, "text/html")
        _send_email_async(msg)
    except Exception as e:
        logger.error("Failed to construct password-changed email to %s: %s", user.email, e, exc_info=True)


def send_staff_invite_email(email, role, department_name, invite_token):
    """Sends an invitation link to a newly invited staff member asynchronously."""
    try:
        import os
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        invite_link = f"{frontend_url}/register?invite={invite_token}"
        subject = 'Invitation to join Al Shifaa Clinic Onboarding Portal'
        context = {
            'email': email,
            'role': role,
            'department_name': department_name,
            'invite_link': invite_link,
        }
        html_content = render_to_string('emails/invite_email.html', context)
        text_content = strip_tags(html_content)

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email]
        )
        msg.attach_alternative(html_content, "text/html")
        _send_email_async(msg)
    except Exception as e:
        logger.error("Failed to construct staff onboarding email to %s: %s", email, e, exc_info=True)


def send_doctor_application_update_email(email, full_name, status, message=None, invite_token=None):
    """Sends status updates to doctors concerning their onboarding applications asynchronously."""
    try:
        import os
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        invite_link = f"{frontend_url}/register?invite={invite_token}" if invite_token else None
        subject = f"Al Shifaa Doctor Application Status: {status}"
        context = {
            'full_name': full_name,
            'status': status,
            'message': message,
            'invite_link': invite_link,
        }
        html_content = render_to_string('emails/application_status_email.html', context)
        text_content = strip_tags(html_content)

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email]
        )
        msg.attach_alternative(html_content, "text/html")
        _send_email_async(msg)
    except Exception as e:
        logger.error("Failed to construct application status update email to %s: %s", email, e, exc_info=True)


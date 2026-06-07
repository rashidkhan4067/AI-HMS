import logging
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings

logger = logging.getLogger(__name__)


def send_welcome_email(user):
    """Sends a styled welcome email to newly registered users."""
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
        msg.send(fail_silently=True)
    except Exception as e:
        logger.error("Failed to send welcome email to %s: %s", user.email, e, exc_info=True)


def send_otp_email(email, otp):
    """
    Sends a styled OTP verification email for password resets.
    Raises on failure so the caller (view) can log the real error.
    """
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
    msg.send(fail_silently=False)  # Raise so the view can log the real SMTP error


def send_password_changed_email(user):
    """Sends a security warning email when a user changes their password."""
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
        msg.send(fail_silently=True)
    except Exception as e:
        logger.error("Failed to send password-changed email to %s: %s", user.email, e, exc_info=True)


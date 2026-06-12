import logging
import time
import copy
from concurrent.futures import ThreadPoolExecutor
from django.core.mail.backends.smtp import EmailBackend
from django.conf import settings

logger = logging.getLogger(__name__)

# Global thread pool for asynchronous email dispatch
# We set max_workers=4 as a sensible default for low-overhead transactional emails
_email_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="email_sender")

class AsynchronousEmailBackend(EmailBackend):
    """
    An industry-standard Django email backend that:
    1. Sends emails asynchronously in a background thread pool (non-blocking).
    2. Supports email redirection to a single 'EMAIL_REDIRECT_TO' address (useful for sandbox/dev).
    3. Implements automatic retries with exponential backoff for robust delivery.
    """
    def send_messages(self, email_messages):
        if not email_messages:
            return 0

        # Clone the messages to ensure thread safety
        messages_to_send = []
        redirect_to = getattr(settings, 'EMAIL_REDIRECT_TO', None)

        for msg in email_messages:
            msg_copy = copy.copy(msg)
            
            # If redirection is configured, override the recipients
            if redirect_to:
                original_recipients = msg_copy.to
                msg_copy.to = [redirect_to]
                # Clear CC/BCC so other recipients don't receive emails
                msg_copy.cc = []
                msg_copy.bcc = []
                
                # Prepend/append redirection info to keep the email context clear
                msg_copy.subject = f"[REDIRECTED to {', '.join(original_recipients)}] {msg_copy.subject}"
                
                redirect_banner_text = f"\n\n--- [REDIRECTED EMAIL] ---\nOriginally intended for: {', '.join(original_recipients)}\n-------------------------\n"
                msg_copy.body = redirect_banner_text + msg_copy.body
                
                # Check and update HTML alternatives
                if hasattr(msg_copy, 'alternatives'):
                    new_alternatives = []
                    for content, mimetype in msg_copy.alternatives:
                        if mimetype == 'text/html':
                            html_banner = (
                                f'<div style="background-color: #FEF3C7; border: 1px solid #D97706; padding: 12px; margin-bottom: 20px; font-family: sans-serif; font-size: 14px; color: #92400E; border-radius: 6px;">'
                                f'<strong>[REDIRECTED EMAIL]</strong> This email was originally intended for: <strong>{", ".join(original_recipients)}</strong>'
                                f'</div>'
                            )
                            content = html_banner + content
                        new_alternatives.append((content, mimetype))
                    msg_copy.alternatives = new_alternatives

            messages_to_send.append(msg_copy)

        # Submit actual SMTP sending task to the thread pool executor
        _email_executor.submit(self._send_messages_with_retry, messages_to_send)

        # Return the count immediately to prevent the HTTP request from blocking
        return len(email_messages)

    def _send_messages_with_retry(self, email_messages):
        """Helper running inside a worker thread to send messages with retry logic."""
        max_retries = 3
        delay = 2  # Start with 2 seconds backoff
        
        for attempt in range(1, max_retries + 1):
            try:
                # Call SMTP backend's send_messages to open a connection, send, and close connection
                sent_count = super().send_messages(email_messages)
                if sent_count == len(email_messages):
                    logger.info(f"Successfully sent {sent_count} email(s) on attempt {attempt}.")
                    return sent_count
                else:
                    logger.warning(f"Sent only {sent_count} of {len(email_messages)} emails on attempt {attempt}.")
            except Exception as e:
                logger.warning(f"Email sending attempt {attempt} failed: {e}", exc_info=True)
            
            if attempt < max_retries:
                logger.info(f"Retrying email dispatch in {delay} seconds...")
                time.sleep(delay)
                delay *= 2  # Exponential backoff
        
        logger.error(f"Failed to send {len(email_messages)} email(s) after {max_retries} attempts.")
        return 0

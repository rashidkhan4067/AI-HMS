import os
import time
import django
from django.conf import settings
from django.core import mail
from django.core.mail import send_mail

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def run_tests():
    print("======================================================================")
    print("Al Shifaa HMS — Email System Verification Script")
    print("======================================================================")
    
    # 1. Test Asynchronous Dispatch Speed
    print("\n1. Testing Async Dispatch Speed...")
    start_time = time.time()
    
    # Send a test email. It should return instantly because of the AsynchronousEmailBackend
    count = send_mail(
        subject='Async Speed Test Email',
        message='This email is sent to verify that the dispatch is asynchronous and non-blocking.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['alshifaaclinic99@gmail.com'],
        fail_silently=False
    )
    
    duration = time.time() - start_time
    print(f"   [RESULT] send_mail returned {count} message(s) queued.")
    print(f"   [RESULT] Dispatch took {duration:.4f} seconds.")
    
    if duration < 0.2:
        print("   [SUCCESS] Email was dispatched asynchronously in < 200ms (Fully Fast!).")
    else:
        print("   [WARNING] Dispatch took longer than expected. Check if AsynchronousEmailBackend is configured correctly.")

    # 2. Test Redirection (if EMAIL_REDIRECT_TO is set)
    print("\n2. Testing Redirection Backend Logic...")
    # Temporarily set redirection email
    original_redirect = getattr(settings, 'EMAIL_REDIRECT_TO', None)
    test_redirect_address = "alshifaaclinic99@gmail.com"
    settings.EMAIL_REDIRECT_TO = test_redirect_address
    
    print(f"   Setting EMAIL_REDIRECT_TO = '{test_redirect_address}'")
    
    # Send email to a fake address. It should get redirected to alshifaaclinic99@gmail.com
    # Note: Because the backend is async, the actual sending runs in a thread pool.
    # We will verify it doesn't crash and prints the redirection info.
    try:
        send_mail(
            subject='Redirection Test Email',
            message='If you see this, the redirection backend successfully routed this email to the testing inbox.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['fake-user-not-real-123@example.com'],
            fail_silently=False
        )
        print("   [SUCCESS] Redirection test email queued successfully without errors.")
    except Exception as e:
        print(f"   [FAILED] Redirection test failed with error: {e}")
        
    # Restore original settings
    settings.EMAIL_REDIRECT_TO = original_redirect
    
    print("\nVerification script complete. Please check the Django server console logs to see the background delivery status.")
    print("======================================================================")

if __name__ == '__main__':
    run_tests()

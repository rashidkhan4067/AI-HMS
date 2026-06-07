from unittest.mock import patch
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.cache import cache
from accounts.models import LoginAuditLog

User = get_user_model()

class GoogleSSOAPITests(APITestCase):
    def setUp(self):
        cache.clear()
        self.google_url = reverse('google_login')
        self.user = User.objects.create_user(
            email='doctor.google@test.com',
            password='password123',
            full_name='Google Doctor',
            role='DOCTOR',
            is_active=True
        )

    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_google_login_success(self, mock_verify):
        mock_verify.return_value = {
            'email': 'doctor.google@test.com',
            'sub': 'google-sub-id-123',
            'iss': 'accounts.google.com',
            'email_verified': True,
            'name': 'Google Doctor'
        }
        
        response = self.client.post(self.google_url, {'id_token': 'fake-google-token'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        # Check cookie
        self.assertIn('refresh_token', response.cookies)
        self.assertTrue(response.cookies['refresh_token']['httponly'])
        self.assertEqual(response.cookies['refresh_token']['samesite'], 'Strict')

        # Check sub linking
        self.user.refresh_from_db()
        self.assertEqual(self.user.google_sub, 'google-sub-id-123')
        self.assertTrue(self.user.is_google_user)
        self.assertTrue(self.user.must_complete_profile)

        # Verify audit log entry
        audit_log = LoginAuditLog.objects.latest('timestamp')
        self.assertEqual(audit_log.email_attempted, 'doctor.google@test.com')
        self.assertEqual(audit_log.login_method, 'GOOGLE')
        self.assertTrue(audit_log.success)

    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_google_login_unregistered(self, mock_verify):
        mock_verify.return_value = {
            'email': 'unregistered@test.com',
            'sub': 'google-sub-id-999',
            'iss': 'accounts.google.com',
            'email_verified': True
        }
        response = self.client.post(self.google_url, {'id_token': 'fake-google-token'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'not_registered')

        # Verify audit log
        audit_log = LoginAuditLog.objects.latest('timestamp')
        self.assertEqual(audit_log.email_attempted, 'unregistered@test.com')
        self.assertFalse(audit_log.success)
        self.assertEqual(audit_log.failure_reason, 'User not registered')

    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_google_login_inactive(self, mock_verify):
        self.user.is_active = False
        self.user.save()

        mock_verify.return_value = {
            'email': 'doctor.google@test.com',
            'sub': 'google-sub-id-123',
            'iss': 'accounts.google.com',
            'email_verified': True
        }
        response = self.client.post(self.google_url, {'id_token': 'fake-google-token'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'inactive_account')

    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_google_login_locked(self, mock_verify):
        self.user.locked_until = timezone.now() + timedelta(minutes=10)
        self.user.save()

        mock_verify.return_value = {
            'email': 'doctor.google@test.com',
            'sub': 'google-sub-id-123',
            'iss': 'accounts.google.com',
            'email_verified': True
        }
        response = self.client.post(self.google_url, {'id_token': 'fake-google-token'})
        self.assertEqual(response.status_code, status.HTTP_423_LOCKED)
        self.assertEqual(response.data['error'], 'account_locked')

    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_google_login_rate_limiting(self, mock_verify):
        mock_verify.return_value = {
            'email': 'doctor.google@test.com',
            'sub': 'google-sub-id-123',
            'iss': 'accounts.google.com',
            'email_verified': True
        }
        # Fire 11 requests
        for i in range(11):
            response = self.client.post(self.google_url, {'id_token': 'fake-google-token'})
            if i >= 10:
                self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
                self.assertEqual(response.data['error'], 'rate_limit_exceeded')

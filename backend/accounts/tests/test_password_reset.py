from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import PasswordResetOTP

User = get_user_model()

class PasswordResetAPITests(APITestCase):
    def setUp(self):
        self.forgot_password_url = reverse('forgot_password')
        self.verify_otp_url = reverse('verify_otp')
        self.reset_password_url = reverse('reset_password')

        self.user = User.objects.create_user(
            email='testreset@test.com',
            password='oldpassword123',
            full_name='Test Reset',
            role='DOCTOR',
            is_active=True
        )

    def test_forgot_password_registered_email(self):
        response = self.client.post(self.forgot_password_url, {'email': 'testreset@test.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(PasswordResetOTP.objects.filter(email='testreset@test.com').exists())

    def test_forgot_password_unregistered_email_returns_400(self):
        response = self.client.post(self.forgot_password_url, {'email': 'nonexistent@test.com'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(PasswordResetOTP.objects.filter(email='nonexistent@test.com').exists())

    def test_verify_otp_success(self):
        otp_record = PasswordResetOTP.objects.create(email='testreset@test.com')
        response = self.client.post(self.verify_otp_url, {
            'email': 'testreset@test.com',
            'otp': otp_record.otp
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        otp_record.refresh_from_db()
        self.assertTrue(otp_record.is_used)

    def test_verify_otp_invalid(self):
        PasswordResetOTP.objects.create(email='testreset@test.com')
        response = self.client.post(self.verify_otp_url, {
            'email': 'testreset@test.com',
            'otp': '999999' # wrong otp
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_success(self):
        otp_record = PasswordResetOTP.objects.create(email='testreset@test.com')
        otp_record.is_used = True
        otp_record.save()

        response = self.client.post(self.reset_password_url, {
            'otp_record_id': otp_record.pk,
            'password': 'newsecurepassword123',
            'confirm_password': 'newsecurepassword123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newsecurepassword123'))
        # OTP records should be deleted
        self.assertFalse(PasswordResetOTP.objects.filter(email='testreset@test.com').exists())

    def test_reset_password_mismatch(self):
        otp_record = PasswordResetOTP.objects.create(email='testreset@test.com')
        otp_record.is_used = True
        otp_record.save()

        response = self.client.post(self.reset_password_url, {
            'otp_record_id': otp_record.pk,
            'password': 'newsecurepassword123',
            'confirm_password': 'differentpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

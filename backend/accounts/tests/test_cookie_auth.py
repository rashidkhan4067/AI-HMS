from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.cache import cache
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

User = get_user_model()

class CookieTokenAuthenticationTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.refresh_url = reverse('token_refresh_custom')
        self.logout_url = reverse('logout')
        self.user = User.objects.create_user(
            email='cookie.test@test.com',
            password='password123',
            full_name='Cookie Tester',
            role='DOCTOR',
            is_active=True
        )

    def test_refresh_token_from_cookie(self):
        # Generate simplejwt tokens
        refresh = RefreshToken.for_user(self.user)
        refresh['role'] = self.user.role
        refresh['full_name'] = self.user.full_name
        
        self.client.cookies['refresh_token'] = str(refresh)
        
        response = self.client.post(self.refresh_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        
        # Check new refresh token was set in cookie (rotated)
        self.assertIn('refresh_token', response.cookies)
        new_cookie_val = response.cookies['refresh_token'].value
        self.assertNotEqual(new_cookie_val, str(refresh))
        
        # Ensure the old refresh token is blacklisted
        self.assertTrue(BlacklistedToken.objects.filter(token__jti=refresh['jti']).exists())

    def test_refresh_token_missing_cookie_fails(self):
        response = self.client.post(self.refresh_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['error'], 'refresh_token_missing')

    def test_refresh_token_invalid_fails(self):
        self.client.cookies['refresh_token'] = 'invalid-token-value'
        response = self.client.post(self.refresh_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['error'], 'invalid_refresh_token')

    def test_logout_blacklists_cookie_and_deletes_cookie(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.cookies['refresh_token'] = str(refresh)
        
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Ensure the refresh token is blacklisted
        self.assertTrue(BlacklistedToken.objects.filter(token__jti=refresh['jti']).exists())
        
        # Check that cookie is deleted
        self.assertEqual(response.cookies['refresh_token'].value, '')

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

class AuthenticationAPITests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.profile_url = reverse('profile')
        self.change_password_url = reverse('change_password')
        self.logout_url = reverse('logout')

        self.user_data = {
            'email': 'john.doe@test.com',
            'password': 'password123',
            'full_name': 'John Doe',
            'role': 'PATIENT'
        }
        # Active user for testing login and profile endpoints
        self.user = User.objects.create_user(
            email='existing@test.com',
            password='password123',
            full_name='Existing User',
            role='DOCTOR',
            is_active=True
        )

    def test_public_registration_success(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.filter(email='john.doe@test.com').count(), 1)
        user = User.objects.get(email='john.doe@test.com')
        self.assertEqual(user.role, 'PATIENT')
        self.assertTrue(user.is_active)

    def test_public_registration_blocks_invalid_role(self):
        bad_data = self.user_data.copy()
        bad_data['email'] = 'fake.admin@test.com'
        bad_data['role'] = 'ADMIN'
        response = self.client.post(self.register_url, bad_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('role', response.data)

    def test_login_success(self):
        login_data = {'email': 'existing@test.com', 'password': 'password123'}
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh_token', response.cookies)
        self.assertEqual(response.data['role'], 'DOCTOR')

    def test_login_inactive_user_fails(self):
        # Create an inactive user
        User.objects.create_user(
            email='inactive@test.com',
            password='password123',
            full_name='Inactive User',
            role='DOCTOR',
            is_active=False
        )
        login_data = {'email': 'inactive@test.com', 'password': 'password123'}
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_invalid_credentials(self):
        login_data = {'email': 'existing@test.com', 'password': 'wrongpassword'}
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_profile_requires_authentication(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_profile_success_with_token(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)

    def test_change_password_success(self):
        self.client.force_authenticate(user=self.user)
        password_data = {
            'old_password': 'password123',
            'new_password': 'newpassword123',
            'confirm_new_password': 'newpassword123'
        }
        response = self.client.put(self.change_password_url, password_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword123'))

    def test_change_password_mismatch(self):
        self.client.force_authenticate(user=self.user)
        password_data = {
            'old_password': 'password123',
            'new_password': 'newpassword123',
            'confirm_new_password': 'differentpassword'
        }
        response = self.client.put(self.change_password_url, password_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_blacklists_token(self):
        login_data = {'email': 'existing@test.com', 'password': 'password123'}
        login_response = self.client.post(self.login_url, login_data)
        self.assertIn('refresh_token', login_response.cookies)
        refresh_token = login_response.cookies['refresh_token'].value

        self.client.cookies['refresh_token'] = refresh_token
        logout_response = self.client.post(self.logout_url)
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        
        # Verify the token is blacklisted
        from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
        import jwt
        decoded = jwt.decode(refresh_token, options={"verify_signature": False})
        jti = decoded['jti']
        self.assertTrue(BlacklistedToken.objects.filter(token__jti=jti).exists())

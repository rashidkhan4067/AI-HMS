from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomUserModelTests(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(email='doctor@test.com', password='password123', full_name='John Doe', role='DOCTOR')
        self.assertEqual(user.email, 'doctor@test.com')
        self.assertTrue(user.check_password('password123'))
        self.assertEqual(user.role, 'DOCTOR')
        self.assertFalse(user.is_active) # Default is False (must be approved by admin)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        user = User.objects.create_superuser(email='admin@test.com', password='password123', full_name='Admin User')
        self.assertEqual(user.email, 'admin@test.com')
        self.assertTrue(user.check_password('password123'))
        self.assertEqual(user.role, 'ADMIN')
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    def test_create_user_no_email_raises_error(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password='password123')

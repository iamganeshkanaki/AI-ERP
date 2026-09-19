from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.users.models import User

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='testuser@apexglobals.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='User',
            role='Sales'
        )

    def test_login_success(self):
        response = self.client.post(reverse('token_obtain_pair'), {
            'email': 'testuser@apexglobals.com',
            'password': 'TestPassword123!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['role'], 'Sales')

    def test_current_user_me(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse('current_user'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], 'testuser@apexglobals.com')

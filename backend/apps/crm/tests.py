from django.test import TestCase
from apps.crm.models import Customer, Lead, Opportunity
from apps.crm.services import CRMService
from apps.users.models import User

class CRMTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='saleslead@apexglobals.com',
            password='Password123!',
            role='Sales'
        )
        self.lead = Lead.objects.create(
            name='Rohit Verma',
            company_name='Verma Heavy Robotics Ltd',
            email='rohit@vermarobotics.com',
            assigned_to=self.user,
            estimated_value=850000.00
        )

    def test_lead_conversion_service(self):
        customer = CRMService.convert_lead_to_customer(self.lead.id, 'CUST-VRB-01')
        self.assertEqual(customer.name, 'Verma Heavy Robotics Ltd')
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.status, 'Converted')
        self.assertEqual(self.lead.converted_customer, customer)

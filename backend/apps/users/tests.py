from django.test import TestCase
from .models import Company, Branch, Department, Employee, User
from .services import UserService

class UserModelTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Apex Globals", code="APX")
        self.branch = Branch.objects.create(company=self.company, name="HQ Tech Park", code="HQ-01")
        self.dept = Department.objects.create(branch=self.branch, name="Finance & Accounts", code="FIN")

    def test_company_creation(self):
        self.assertEqual(str(self.company), "Apex Globals (APX)")

    def test_onboard_employee_with_user(self):
        emp_data = {
            'department': self.dept,
            'employee_id': 'EMP-771',
            'first_name': 'Ganesh',
            'last_name': 'Kanaki',
            'email': 'ganesh@apexglobals.com',
            'designation': 'ERP Admin',
            'hire_date': '2026-01-01',
            'salary': 150000.00
        }
        user_data = {
            'role': 'Admin',
            'password': 'SecurePassword123!'
        }
        employee, user = UserService.onboard_employee_with_user(emp_data, user_data)
        self.assertEqual(employee.full_name, 'Ganesh Kanaki')
        self.assertIsNotNone(user)
        self.assertEqual(user.role, 'Admin')
        self.assertTrue(user.check_password('SecurePassword123!'))

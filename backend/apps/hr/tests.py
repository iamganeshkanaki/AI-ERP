from decimal import Decimal
from django.test import TestCase
from apps.users.models import Company, Branch, Department, Employee, User
from apps.hr.models import LeaveRequest, ExpenseClaim
from apps.hr.services import HRService

class HRWorkflowTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Apex Globals", code="APX")
        self.branch = Branch.objects.create(company=self.company, name="HQ", code="HQ")
        self.dept = Department.objects.create(branch=self.branch, name="HR", code="HR")
        self.approver = User.objects.create_user(email='hrmanager@apexglobals.com', role='HR')
        self.employee = Employee.objects.create(
            department=self.dept,
            employee_id='EMP-201',
            first_name='Ananya',
            last_name='Roy',
            email='ananya@apexglobals.com',
            hire_date='2026-01-15',
            designation='Engineer'
        )
        self.leave = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type='Paid',
            start_date='2026-10-01',
            end_date='2026-10-03',
            reason='Family event',
            status='Pending'
        )

    def test_approve_leave(self):
        approved_leave = HRService.approve_leave_request(self.leave.id, self.approver)
        self.assertEqual(approved_leave.status, 'Approved')
        self.assertEqual(approved_leave.approved_by, self.approver)

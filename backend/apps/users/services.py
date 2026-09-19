from django.db import transaction
from .models import Company, Branch, Department, Employee, User

class UserService:
    @staticmethod
    @transaction.atomic
    def onboard_employee_with_user(employee_data, user_data=None):
        """Creates an employee record and optionally sets up system login credentials."""
        employee = Employee.objects.create(**employee_data)
        user = None
        if user_data:
            password = user_data.pop('password', None)
            user = User(
                email=user_data.get('email', employee.email),
                username=user_data.get('email', employee.email),
                first_name=employee.first_name,
                last_name=employee.last_name,
                employee=employee,
                company=employee.department.branch.company,
                role=user_data.get('role', 'Viewer'),
                phone=employee.phone
            )
            if password:
                user.set_password(password)
            else:
                user.set_unusable_password()
            user.save()
        return employee, user

    @staticmethod
    def get_organization_tree(company_id):
        """Returns the full branch-department-employee hierarchy for an enterprise."""
        company = Company.objects.prefetch_related('branches__departments__employees').get(id=company_id)
        return company

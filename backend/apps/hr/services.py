from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import LeaveRequest, ExpenseClaim, PayrollRecord, Attendance

class HRService:
    @staticmethod
    @transaction.atomic
    def approve_leave_request(leave_id, approver_user):
        leave = LeaveRequest.objects.select_for_update().get(id=leave_id)
        if leave.status != 'Pending':
            raise ValidationError(f"Leave cannot be approved from status '{leave.status}'")

        leave.status = 'Approved'
        leave.approved_by = approver_user
        leave.save(update_fields=['status', 'approved_by'])
        return leave

    @staticmethod
    @transaction.atomic
    def reject_leave_request(leave_id, approver_user, reason=''):
        leave = LeaveRequest.objects.select_for_update().get(id=leave_id)
        leave.status = 'Rejected'
        leave.approved_by = approver_user
        leave.rejection_reason = reason
        leave.save(update_fields=['status', 'approved_by', 'rejection_reason'])
        return leave

    @staticmethod
    @transaction.atomic
    def approve_expense_claim(expense_id, approver_user):
        claim = ExpenseClaim.objects.select_for_update().get(id=expense_id)
        if claim.status != 'Pending':
            raise ValidationError(f"Expense cannot be approved from status '{claim.status}'")

        claim.status = 'Approved'
        claim.approved_by = approver_user
        claim.save(update_fields=['status', 'approved_by'])
        return claim

    @staticmethod
    def calculate_net_payroll(base_salary, allowances=Decimal('0.00'), deductions=Decimal('0.00'), tax_rate=Decimal('10.0')):
        gross = base_salary + allowances
        tax = (gross * (tax_rate / Decimal('100.0'))).quantize(Decimal('0.01'))
        net = gross - deductions - tax
        return net, tax

from decimal import Decimal
from django.db import models
from apps.core.models import AuditableModel
from apps.users.models import Employee, User

class Attendance(AuditableModel):
    """Daily employee punch attendance."""
    STATUS_CHOICES = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('HalfDay', 'Half Day'),
        ('OnLeave', 'On Approved Leave'),
        ('Holiday', 'Company Holiday'),
    )

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(db_index=True)
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Present')
    work_hours = models.DecimalField(max_digits=4, decimal_places=2, default=8.0)
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ('employee', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.date} ({self.status})"

class LeaveRequest(AuditableModel):
    """Paid and statutory employee time-off request."""
    LEAVE_TYPES = (
        ('Casual', 'Casual Leave'),
        ('Sick', 'Sick / Medical Leave'),
        ('Paid', 'Earned / Paid Leave'),
        ('Maternity', 'Maternity / Paternity'),
        ('Unpaid', 'Loss of Pay'),
    )

    STATUS_CHOICES = (
        ('Pending', 'Pending Manager Approval'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Cancelled', 'Cancelled'),
    )

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=30, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    days_count = models.DecimalField(max_digits=4, decimal_places=1, default=1.0)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending', db_index=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    rejection_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.leave_type} ({self.status})"

class PayrollRecord(AuditableModel):
    """Monthly employee compensation summary."""
    STATUS_CHOICES = (
        ('Draft', 'Draft'),
        ('Approved', 'Approved'),
        ('Paid', 'Disbursed & Paid'),
    )

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payrolls')
    month = models.PositiveSmallIntegerField()
    year = models.PositiveSmallIntegerField()
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)
    allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_deducted = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    payment_reference = models.CharField(max_length=100, blank=True)

    class Meta:
        unique_together = ('employee', 'month', 'year')
        ordering = ['-year', '-month']

    def __str__(self):
        return f"{self.employee.full_name} - {self.month}/{self.year} (₹{self.net_salary})"

class ExpenseClaim(AuditableModel):
    """Staff business travel and operational expense reimbursement."""
    STATUS_CHOICES = (
        ('Pending', 'Pending Approval'),
        ('Approved', 'Approved for Payment'),
        ('Reimbursed', 'Reimbursed / Paid'),
        ('Rejected', 'Rejected'),
    )

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='expense_claims')
    claim_title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default='Travel & Lodging')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    expense_date = models.DateField()
    receipt_url = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending', db_index=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_expenses')

    class Meta:
        ordering = ['-expense_date']

    def __str__(self):
        return f"{self.claim_title} - {self.employee.full_name} (₹{self.amount})"

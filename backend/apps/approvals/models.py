from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from apps.core.models import AuditableModel
from apps.users.models import User

class ApprovalRequest(AuditableModel):
    """Centralized authorization queue item for high-value operations."""
    MODULE_CHOICES = (
        ('Sales', 'Sales Order / Credit Exception'),
        ('Purchase', 'Purchase Order Authorization'),
        ('HR', 'Leave / Expense Reimbursement'),
        ('Finance', 'Disbursement / Asset Write-off'),
        ('Inventory', 'Stock Adjustment Authorization'),
    )

    STATUS_CHOICES = (
        ('Pending', 'Pending Authorization'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    module = models.CharField(max_length=30, choices=MODULE_CHOICES, db_index=True)
    reference_title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_approvals')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending', db_index=True)
    current_step = models.PositiveSmallIntegerField(default=1)
    required_steps = models.PositiveSmallIntegerField(default=1)

    # Generic relation to target object
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.CharField(max_length=255, null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.module}] {self.reference_title} ({self.status})"

class ApprovalAction(AuditableModel):
    """Audit log of individual decision action within an approval request."""
    ACTION_CHOICES = (
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    approval_request = models.ForeignKey(ApprovalRequest, on_delete=models.CASCADE, related_name='actions')
    step_number = models.PositiveSmallIntegerField()
    approver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='approval_actions')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    comments = models.TextField(blank=True)
    action_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['step_number', 'action_date']

    def __str__(self):
        return f"Step {self.step_number}: {self.action} by {self.approver.email}"

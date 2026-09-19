from decimal import Decimal
from django.db import models
from apps.core.models import AuditableModel
from apps.crm.models import Customer
from apps.users.models import User

class Project(AuditableModel):
    """Client deliverable engagement or internal initiative."""
    STATUS_CHOICES = (
        ('Planning', 'Planning'),
        ('Active', 'In Progress / Active'),
        ('OnHold', 'On Hold'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )

    project_code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    spent_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Active', db_index=True)
    project_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_projects')
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_date']

    @property
    def burn_rate_percentage(self):
        if self.budget and self.budget > Decimal('0.00'):
            return round((self.spent_amount / self.budget) * 100, 1)
        return 0.0

    def __str__(self):
        return f"{self.project_code} - {self.name}"

class ProjectMilestone(AuditableModel):
    """Key deliverable milestone with billing trigger."""
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('In_Progress', 'In Progress'),
        ('Completed', 'Completed & Delivered'),
    )

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=255)
    due_date = models.DateField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    completion_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        return f"{self.project.project_code}: {self.title}"

class ProjectTask(AuditableModel):
    """Sprint work item or work breakdown element."""
    STATUS_CHOICES = (
        ('Todo', 'To Do'),
        ('InProgress', 'In Progress'),
        ('Review', 'Under Review'),
        ('Done', 'Completed'),
    )

    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    )

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    milestone = models.ForeignKey(ProjectMilestone, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    title = models.CharField(max_length=255)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Todo', db_index=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    estimated_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    logged_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    due_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['status', '-created_at']

    def __str__(self):
        return f"[{self.project.project_code}] {self.title}"

from django.db import models
from apps.core.models import AuditableModel
from apps.crm.models import Customer
from apps.inventory.models import Product
from apps.users.models import User

class ServiceTicket(AuditableModel):
    """Customer issue or field technician assignment ticket."""
    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    )

    STATUS_CHOICES = (
        ('Open', 'Open'),
        ('In_Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
    )

    ticket_number = models.CharField(max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='service_tickets')
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open', db_index=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    resolution_notes = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.ticket_number} - {self.title} ({self.status})"

class WarrantyRecord(AuditableModel):
    """Product serialised warranty validity."""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='warranties')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='warranties')
    serial_number = models.CharField(max_length=100, db_index=True)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-end_date']

    def __str__(self):
        return f"{self.serial_number} ({self.product.name}) - Valid until {self.end_date}"

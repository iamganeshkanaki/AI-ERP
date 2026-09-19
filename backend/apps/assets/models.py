from django.db import models
from apps.core.models import AuditableModel
from apps.users.models import Employee, Branch

class Asset(AuditableModel):
    """Capital equipment, tooling, or physical infrastructure asset."""
    STATUS_CHOICES = (
        ('Active', 'Operational / Active'),
        ('Under_Maintenance', 'Under Maintenance'),
        ('Decommissioned', 'Decommissioned / Retired'),
    )

    asset_code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    category = models.CharField(max_length=100, default='Machinery')
    serial_number = models.CharField(max_length=100, blank=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='assets')
    location_details = models.CharField(max_length=255, blank=True)
    purchase_date = models.DateField()
    purchase_cost = models.DecimalField(max_digits=14, decimal_places=2)
    current_value = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Active')
    assigned_employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_assets')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.asset_code} - {self.name}"

class AssetMaintenance(AuditableModel):
    """Scheduled service, overhaul, or breakdown maintenance record."""
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='maintenance_logs')
    maintenance_date = models.DateField()
    cost = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    service_provider = models.CharField(max_length=255)
    description = models.TextField()
    next_service_due = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-maintenance_date']

    def __str__(self):
        return f"{self.asset.asset_code} Servicing on {self.maintenance_date}"

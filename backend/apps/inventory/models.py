from django.db import models
from apps.core.models import AuditableModel
from apps.users.models import Branch

class Warehouse(AuditableModel):
    """Physical storage depot or manufacturing facility."""
    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='warehouses')
    location = models.CharField(max_length=255, blank=True)
    capacity_sqft = models.PositiveIntegerField(default=10000)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.code} - {self.name}"

class ProductCategory(AuditableModel):
    """Hierarchy classification for items and SKUs."""
    name = models.CharField(max_length=150, unique=True)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Product Categories'
        ordering = ['name']

    def __str__(self):
        return self.name

class Product(AuditableModel):
    """Stock Keeping Unit (SKU) product record."""
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    category = models.ForeignKey(ProductCategory, on_delete=models.PROTECT, related_name='products')
    unit = models.CharField(max_length=30, default='Nos')
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Selling price")
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Standard procurement cost")
    reorder_level = models.DecimalField(max_digits=12, decimal_places=2, default=10.0)
    safety_stock = models.DecimalField(max_digits=12, decimal_places=2, default=5.0)
    hsn_sac_code = models.CharField(max_length=30, blank=True, help_text="Tax Harmonized Code")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.0)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.sku} - {self.name}"

class Stock(AuditableModel):
    """Quantity on hand of a specific product in a specific warehouse."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stocks')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='stocks')
    quantity = models.DecimalField(max_digits=14, decimal_places=2, default=0.00, db_index=True)
    reserved_quantity = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)

    class Meta:
        unique_together = ('product', 'warehouse')
        ordering = ['product', 'warehouse']

    @property
    def available_quantity(self):
        return max(Decimal('0.00'), self.quantity - self.reserved_quantity)

    @property
    def is_low_stock(self):
        return self.available_quantity <= self.product.reorder_level

    def __str__(self):
        return f"{self.product.sku} @ {self.warehouse.code}: {self.quantity} {self.product.unit}"

class StockMovement(AuditableModel):
    """Immutable audit ledger of physical inventory movements."""
    MOVEMENT_TYPES = (
        ('Inward', 'Inward Receipt (PO/Return)'),
        ('Outward', 'Outward Dispatch (SO)'),
        ('Transfer', 'Inter-Warehouse Transfer'),
        ('Adjustment', 'Cycle Count Adjustment'),
        ('Scrap', 'Scrap / Damaged Write-off'),
    )

    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='movements')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, related_name='movements')
    target_warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, null=True, blank=True, related_name='incoming_transfers')
    movement_type = models.CharField(max_length=30, choices=MOVEMENT_TYPES, db_index=True)
    quantity = models.DecimalField(max_digits=14, decimal_places=2)
    reference_number = models.CharField(max_length=100, db_index=True, help_text="SO, PO, GRN or Adjustment ID")
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.movement_type} {self.quantity} of {self.product.sku} ({self.warehouse.code})"

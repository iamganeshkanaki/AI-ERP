from django.db import models
from apps.core.models import AuditableModel
from apps.users.models import User

class Vendor(AuditableModel):
    """Supplier and procurement vendor."""
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Pending_Review', 'Pending Review'),
        ('Blacklisted', 'Blacklisted'),
        ('Inactive', 'Inactive'),
    )

    vendor_code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    contact_person = models.CharField(max_length=150, blank=True)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=30, blank=True)
    tax_id = models.CharField(max_length=50, blank=True, help_text="GSTIN / VAT ID")
    address = models.TextField(blank=True)
    payment_terms_days = models.PositiveIntegerField(default=30)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.5)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Active')
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_ifsc = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.vendor_code} - {self.name}"

class PurchaseOrder(AuditableModel):
    """Purchase Order placed with an external supplier."""
    STATUS_CHOICES = (
        ('Draft', 'Draft'),
        ('Pending_Approval', 'Pending Approval'),
        ('Approved', 'Approved'),
        ('Sent', 'Sent to Vendor'),
        ('Partially_Received', 'Partially Received'),
        ('Received', 'Received in Full'),
        ('Cancelled', 'Cancelled'),
    )

    po_number = models.CharField(max_length=50, unique=True, db_index=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.PROTECT, related_name='purchase_orders')
    order_date = models.DateField()
    expected_delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Draft', db_index=True)
    
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    tax_total = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    grand_total = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_pos')
    approved_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-order_date', '-created_at']

    def __str__(self):
        return f"{self.po_number} - {self.vendor.name}"

class PurchaseOrderItem(AuditableModel):
    """Line item in a Purchase Order."""
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('inventory.Product', on_delete=models.PROTECT, related_name='purchase_order_items')
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    received_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.purchase_order.po_number} - Item {self.product.name}"

class GoodsReceipt(AuditableModel):
    """Goods Receipt Note (GRN) for warehouse receipt."""
    STATUS_CHOICES = (
        ('Draft', 'Draft'),
        ('Verified', 'Verified & Inwarded'),
        ('Rejected', 'Rejected'),
    )

    grn_number = models.CharField(max_length=50, unique=True, db_index=True)
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.PROTECT, related_name='goods_receipts')
    warehouse = models.ForeignKey('inventory.Warehouse', on_delete=models.PROTECT, related_name='goods_receipts')
    receipt_date = models.DateTimeField()
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    remarks = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Verified')

    class Meta:
        ordering = ['-receipt_date']

    def __str__(self):
        return f"{self.grn_number} for {self.purchase_order.po_number}"

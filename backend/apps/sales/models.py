from django.db import models
from apps.core.models import AuditableModel
from apps.crm.models import Customer
from apps.users.models import User

class SalesOrder(AuditableModel):
    """Customer sales agreement and fulfillment order."""
    STATUS_CHOICES = (
        ('Draft', 'Draft'),
        ('Pending_Approval', 'Pending Approval'),
        ('Confirmed', 'Confirmed'),
        ('Processing', 'Processing'),
        ('Partially_Delivered', 'Partially Delivered'),
        ('Delivered', 'Delivered'),
        ('Invoiced', 'Invoiced'),
        ('Cancelled', 'Cancelled'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('Unpaid', 'Unpaid'),
        ('Partially_Paid', 'Partially Paid'),
        ('Paid', 'Paid'),
    )

    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='sales_orders')
    order_date = models.DateField()
    expected_delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Draft', db_index=True)
    payment_status = models.CharField(max_length=30, choices=PAYMENT_STATUS_CHOICES, default='Unpaid')
    
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    tax_total = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    discount_total = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    grand_total = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    
    currency = models.CharField(max_length=10, default='INR')
    billing_address = models.TextField(blank=True)
    shipping_address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    assigned_rep = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sales_orders')

    class Meta:
        ordering = ['-order_date', '-created_at']

    def __str__(self):
        return f"{self.order_number} - {self.customer.name}"

class SalesOrderItem(AuditableModel):
    """Individual line item within a Sales Order."""
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('inventory.Product', on_delete=models.PROTECT, related_name='sales_order_items')
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00, help_text="Percentage tax, e.g. 18.0 for 18% GST")
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    delivered_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sales_order.order_number} - Line Item ({self.product})"

class DeliveryNote(AuditableModel):
    """Outward delivery dispatch and tracking note."""
    STATUS_CHOICES = (
        ('Scheduled', 'Scheduled'),
        ('In_Transit', 'In Transit'),
        ('Delivered', 'Delivered'),
        ('Returned', 'Returned'),
    )

    delivery_number = models.CharField(max_length=50, unique=True, db_index=True)
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.PROTECT, related_name='deliveries')
    dispatch_date = models.DateTimeField()
    delivery_date = models.DateTimeField(null=True, blank=True)
    carrier = models.CharField(max_length=100, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Scheduled')
    recipient_name = models.CharField(max_length=150, blank=True)
    delivery_notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-dispatch_date']

    def __str__(self):
        return f"{self.delivery_number} ({self.sales_order.order_number})"

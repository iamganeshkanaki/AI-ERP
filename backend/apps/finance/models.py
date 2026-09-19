from decimal import Decimal
from django.db import models
from apps.core.models import AuditableModel
from apps.crm.models import Customer
from apps.purchase.models import Vendor, PurchaseOrder
from apps.sales.models import SalesOrder

class ChartOfAccounts(AuditableModel):
    """General Ledger Account Definition."""
    ACCOUNT_TYPES = (
        ('Asset', 'Asset'),
        ('Liability', 'Liability'),
        ('Equity', 'Equity'),
        ('Revenue', 'Revenue'),
        ('Expense', 'Expense'),
    )

    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=150, db_index=True)
    account_type = models.CharField(max_length=30, choices=ACCOUNT_TYPES)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Chart of Accounts'
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name} ({self.account_type})"

class Invoice(AuditableModel):
    """Customer Sales Invoice (Accounts Receivable)."""
    STATUS_CHOICES = (
        ('Draft', 'Draft'),
        ('Sent', 'Sent / Open'),
        ('Partially_Paid', 'Partially Paid'),
        ('Paid', 'Fully Paid'),
        ('Overdue', 'Overdue'),
        ('Void', 'Void'),
    )

    invoice_number = models.CharField(max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='invoices')
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    issue_date = models.DateField(db_index=True)
    due_date = models.DateField(db_index=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Draft', db_index=True)

    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    paid_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)

    currency = models.CharField(max_length=10, default='INR')
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-issue_date', '-created_at']

    @property
    def balance_due(self):
        return max(Decimal('0.00'), self.total_amount - self.paid_amount)

    def __str__(self):
        return f"{self.invoice_number} - {self.customer.name} (₹{self.total_amount})"

class InvoiceItem(AuditableModel):
    """Line item for customer sales invoice."""
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('inventory.Product', on_delete=models.PROTECT, null=True, blank=True)
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)

    class Meta:
        ordering = ['created_at']

class VendorInvoice(AuditableModel):
    """Supplier purchase bill (Accounts Payable)."""
    STATUS_CHOICES = (
        ('Draft', 'Draft'),
        ('Approved', 'Approved for Payment'),
        ('Partially_Paid', 'Partially Paid'),
        ('Paid', 'Fully Paid'),
        ('Overdue', 'Overdue'),
    )

    bill_number = models.CharField(max_length=50, unique=True, db_index=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.PROTECT, related_name='bills')
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.SET_NULL, null=True, blank=True, related_name='bills')
    issue_date = models.DateField(db_index=True)
    due_date = models.DateField(db_index=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Draft')

    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    paid_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)

    class Meta:
        ordering = ['-issue_date']

    @property
    def balance_due(self):
        return max(Decimal('0.00'), self.total_amount - self.paid_amount)

    def __str__(self):
        return f"{self.bill_number} - {self.vendor.name}"

class Payment(AuditableModel):
    """Settlement transaction (AR collection or AP disbursement)."""
    PAYMENT_TYPES = (
        ('Inward', 'Customer Receipt (AR)'),
        ('Outward', 'Vendor Disbursement (AP)'),
    )

    PAYMENT_METHODS = (
        ('Bank_Transfer', 'Bank Transfer / NEFT / RTGS'),
        ('Cheque', 'Cheque'),
        ('Card', 'Credit / Debit Card'),
        ('UPI', 'UPI Payment'),
        ('Cash', 'Cash'),
    )

    payment_number = models.CharField(max_length=50, unique=True, db_index=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES, db_index=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, null=True, blank=True, related_name='payments')
    vendor = models.ForeignKey(Vendor, on_delete=models.PROTECT, null=True, blank=True, related_name='payments')
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    vendor_invoice = models.ForeignKey(VendorInvoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    payment_date = models.DateField(db_index=True)
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHODS, default='Bank_Transfer')
    reference_number = models.CharField(max_length=100, blank=True, help_text="UTR / Cheque / Transaction ID")
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-payment_date', '-created_at']

    def __str__(self):
        party = self.customer.name if self.customer else (self.vendor.name if self.vendor else 'Direct')
        return f"{self.payment_number} - {self.payment_type} (₹{self.amount}) for {party}"

class GeneralLedger(AuditableModel):
    """Double-entry general ledger journal."""
    transaction_date = models.DateField(db_index=True)
    account = models.ForeignKey(ChartOfAccounts, on_delete=models.PROTECT, related_name='ledger_entries')
    debit = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    credit = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    reference_type = models.CharField(max_length=50, help_text="Invoice, Bill, Payment, Payroll")
    reference_number = models.CharField(max_length=100, db_index=True)
    description = models.TextField()

    class Meta:
        ordering = ['-transaction_date', '-created_at']

    def __str__(self):
        return f"{self.transaction_date} | {self.account.code} | Dr:{self.debit} Cr:{self.credit}"

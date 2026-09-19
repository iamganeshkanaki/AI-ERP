from django.db import models
from apps.core.models import AuditableModel
from apps.users.models import User

class Customer(AuditableModel):
    """Enterprise client profile."""
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Suspended', 'Suspended'),
        ('Prospect', 'Prospect'),
    )

    customer_code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    contact_person = models.CharField(max_length=150, blank=True)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=30, blank=True)
    tax_number = models.CharField(max_length=50, blank=True, help_text="GSTIN / VAT ID")
    billing_address = models.TextField(blank=True)
    shipping_address = models.TextField(blank=True)
    credit_limit = models.DecimalField(max_digits=14, decimal_places=2, default=500000.00)
    current_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    payment_terms_days = models.PositiveIntegerField(default=30)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    industry = models.CharField(max_length=100, blank=True)
    account_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_customers')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.customer_code} - {self.name}"

class Lead(AuditableModel):
    """Prospective business lead."""
    STATUS_CHOICES = (
        ('New', 'New'),
        ('Contacted', 'Contacted'),
        ('Qualified', 'Qualified'),
        ('Unqualified', 'Unqualified'),
        ('Converted', 'Converted'),
    )

    name = models.CharField(max_length=150)
    company_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='New')
    source = models.CharField(max_length=100, default='Direct Referral')
    estimated_value = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_leads')
    converted_customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='originating_lead')
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.company_name or 'Individual'})"

class Opportunity(AuditableModel):
    """Pipeline deal tracking stage and forecast."""
    STAGE_CHOICES = (
        ('Discovery', 'Discovery'),
        ('Proposal', 'Proposal'),
        ('Negotiation', 'Negotiation'),
        ('Won', 'Closed Won'),
        ('Lost', 'Closed Lost'),
    )

    title = models.CharField(max_length=255)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='opportunities')
    stage = models.CharField(max_length=30, choices=STAGE_CHOICES, default='Discovery', db_index=True)
    expected_revenue = models.DecimalField(max_digits=14, decimal_places=2)
    probability_percentage = models.PositiveSmallIntegerField(default=20)
    target_close_date = models.DateField()
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='opportunities')
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Opportunities'
        ordering = ['-target_close_date']

    @property
    def weighted_revenue(self):
        return (self.expected_revenue * self.probability_percentage) / 100

    def __str__(self):
        return f"{self.title} - {self.customer.name} ({self.stage})"

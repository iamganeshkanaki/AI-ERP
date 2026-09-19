import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from apps.core.models import TimeStampedModel

class Company(TimeStampedModel):
    """Root organization legal entity."""
    name = models.CharField(max_length=255, unique=True, db_index=True)
    code = models.CharField(max_length=20, unique=True)
    tax_id = models.CharField(max_length=50, blank=True, help_text="GSTIN / VAT / EIN")
    currency = models.CharField(max_length=10, default='INR')
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    address_line = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='India')
    postal_code = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Companies'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"

class Branch(TimeStampedModel):
    """Company location / plant / warehouse branch."""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='branches')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, db_index=True)
    is_headquarters = models.BooleanField(default=False)
    address_line = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='India')
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Branches'
        unique_together = ('company', 'code')
        ordering = ['company', 'name']

    def __str__(self):
        return f"{self.name} - {self.company.code}"

class Department(TimeStampedModel):
    """Organizational functional unit."""
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50)
    manager = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_departments')
    cost_center_code = models.CharField(max_length=50, blank=True)

    class Meta:
        unique_together = ('branch', 'code')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.branch.name})"

class Employee(TimeStampedModel):
    """Human resources workforce record."""
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('OnLeave', 'On Leave'),
        ('Terminated', 'Terminated'),
        ('Probation', 'Probation'),
    )

    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='employees')
    employee_id = models.CharField(max_length=50, unique=True, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=30, blank=True)
    designation = models.CharField(max_length=150)
    hire_date = models.DateField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Active')
    reporting_manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates')
    salary = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)

    class Meta:
        ordering = ['first_name', 'last_name']

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'Admin')
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    """Custom ERP user with RBAC role and linked employee profile."""
    ROLE_CHOICES = (
        ('Admin', 'System Administrator'),
        ('Executive', 'C-Level / Executive'),
        ('Finance', 'Finance / Accounts'),
        ('Sales', 'Sales & CRM'),
        ('Purchase', 'Purchase & Procurement'),
        ('Inventory', 'Warehouse & Inventory'),
        ('HR', 'Human Resources'),
        ('Service', 'Service & Support'),
        ('Viewer', 'Read-Only Viewer'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    employee = models.OneToOneField(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_account')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='Viewer', db_index=True)
    avatar_url = models.URLField(blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        ordering = ['email']

    def __str__(self):
        return f"{self.email} ({self.role})"

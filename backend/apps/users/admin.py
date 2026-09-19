from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Company, Branch, Department, Employee, User

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'currency', 'is_active', 'created_at')
    search_fields = ('name', 'code', 'tax_id')

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'company', 'city', 'is_headquarters', 'is_active')
    list_filter = ('company', 'is_active')

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'branch', 'manager')
    list_filter = ('branch__company',)

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'full_name', 'email', 'department', 'designation', 'status')
    list_filter = ('status', 'department')
    search_fields = ('employee_id', 'first_name', 'last_name', 'email')

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'company', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active', 'company')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone', 'avatar_url')}),
        ('ERP Permissions', {'fields': ('role', 'company', 'employee')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

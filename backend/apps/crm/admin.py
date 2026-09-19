from django.contrib import admin
from .models import Customer, Lead, Opportunity

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('customer_code', 'name', 'contact_person', 'email', 'status', 'current_balance')
    list_filter = ('status', 'industry')
    search_fields = ('customer_code', 'name', 'email')

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'company_name', 'status', 'source', 'estimated_value', 'assigned_to')
    list_filter = ('status', 'source')
    search_fields = ('name', 'company_name', 'email')

@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ('title', 'customer', 'stage', 'expected_revenue', 'probability_percentage', 'target_close_date')
    list_filter = ('stage', 'target_close_date')
    search_fields = ('title', 'customer__name')

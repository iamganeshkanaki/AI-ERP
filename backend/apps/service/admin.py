from django.contrib import admin
from .models import ServiceTicket, WarrantyRecord

@admin.register(ServiceTicket)
class ServiceTicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_number', 'customer', 'title', 'priority', 'status', 'assigned_to', 'created_at')
    list_filter = ('status', 'priority')
    search_fields = ('ticket_number', 'title', 'customer__name')

@admin.register(WarrantyRecord)
class WarrantyRecordAdmin(admin.ModelAdmin):
    list_display = ('serial_number', 'customer', 'product', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('serial_number', 'customer__name', 'product__name')

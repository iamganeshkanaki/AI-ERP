from django.contrib import admin
from .models import SalesOrder, SalesOrderItem, DeliveryNote

class SalesOrderItemInline(admin.TabularInline):
    model = SalesOrderItem
    extra = 1

@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer', 'order_date', 'status', 'payment_status', 'grand_total')
    list_filter = ('status', 'payment_status', 'order_date')
    search_fields = ('order_number', 'customer__name')
    inlines = [SalesOrderItemInline]

@admin.register(DeliveryNote)
class DeliveryNoteAdmin(admin.ModelAdmin):
    list_display = ('delivery_number', 'sales_order', 'dispatch_date', 'status', 'carrier')
    list_filter = ('status',)
    search_fields = ('delivery_number', 'sales_order__order_number', 'tracking_number')

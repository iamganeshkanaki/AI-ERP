from django.contrib import admin
from .models import Vendor, PurchaseOrder, PurchaseOrderItem, GoodsReceipt

class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('vendor_code', 'name', 'contact_person', 'email', 'status', 'rating')
    list_filter = ('status',)
    search_fields = ('vendor_code', 'name', 'email')

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('po_number', 'vendor', 'order_date', 'status', 'grand_total', 'approved_by')
    list_filter = ('status', 'order_date')
    search_fields = ('po_number', 'vendor__name')
    inlines = [PurchaseOrderItemInline]

@admin.register(GoodsReceipt)
class GoodsReceiptAdmin(admin.ModelAdmin):
    list_display = ('grn_number', 'purchase_order', 'warehouse', 'receipt_date', 'status')
    list_filter = ('status', 'warehouse')
    search_fields = ('grn_number', 'purchase_order__po_number')

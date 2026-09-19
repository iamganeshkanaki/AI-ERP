from django.contrib import admin
from .models import Warehouse, ProductCategory, Product, Stock, StockMovement

@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'branch', 'location', 'is_active')
    list_filter = ('is_active', 'branch')
    search_fields = ('code', 'name')

@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('sku', 'name', 'category', 'unit', 'unit_price', 'cost_price', 'reorder_level', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('sku', 'name', 'hsn_sac_code')

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('product', 'warehouse', 'quantity', 'reserved_quantity', 'is_low_stock')
    list_filter = ('warehouse', 'product__category')
    search_fields = ('product__name', 'product__sku', 'warehouse__name')

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('movement_type', 'product', 'warehouse', 'quantity', 'reference_number', 'created_at')
    list_filter = ('movement_type', 'warehouse')
    search_fields = ('reference_number', 'product__sku')

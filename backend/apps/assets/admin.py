from django.contrib import admin
from .models import Asset, AssetMaintenance

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('asset_code', 'name', 'category', 'branch', 'purchase_cost', 'current_value', 'status')
    list_filter = ('status', 'category')
    search_fields = ('asset_code', 'name')

@admin.register(AssetMaintenance)
class AssetMaintenanceAdmin(admin.ModelAdmin):
    list_display = ('asset', 'maintenance_date', 'cost', 'service_provider', 'next_service_due')
    list_filter = ('maintenance_date',)

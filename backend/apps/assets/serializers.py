from rest_framework import serializers
from .models import Asset, AssetMaintenance

class AssetMaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetMaintenance
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class AssetSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    assigned_employee_name = serializers.CharField(source='assigned_employee.full_name', read_only=True)
    maintenance_count = serializers.IntegerField(source='maintenance_logs.count', read_only=True)

    class Meta:
        model = Asset
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'maintenance_count']

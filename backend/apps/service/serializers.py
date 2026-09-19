from rest_framework import serializers
from .models import ServiceTicket, WarrantyRecord

class WarrantyRecordSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = WarrantyRecord
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ServiceTicketSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)

    class Meta:
        model = ServiceTicket
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'resolved_at']

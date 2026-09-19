from rest_framework import serializers
from .models import SalesOrder, SalesOrderItem, DeliveryNote

class SalesOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = SalesOrderItem
        fields = '__all__'
        read_only_fields = ['id', 'tax_amount', 'total_amount', 'delivered_quantity']

class SalesOrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_code = serializers.CharField(source='customer.customer_code', read_only=True)
    items = SalesOrderItemSerializer(many=True, required=False)

    class Meta:
        model = SalesOrder
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'subtotal', 'tax_total', 'grand_total']

class DeliveryNoteSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='sales_order.customer.name', read_only=True)
    order_number = serializers.CharField(source='sales_order.order_number', read_only=True)

    class Meta:
        model = DeliveryNote
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

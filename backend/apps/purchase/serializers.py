from rest_framework import serializers
from .models import Vendor, PurchaseOrder, PurchaseOrderItem, GoodsReceipt

class VendorSerializer(serializers.ModelSerializer):
    open_orders_count = serializers.IntegerField(source='purchase_orders.count', read_only=True)

    class Meta:
        model = Vendor
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = '__all__'
        read_only_fields = ['id', 'tax_amount', 'total_amount', 'received_quantity']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    vendor_code = serializers.CharField(source='vendor.vendor_code', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    items = PurchaseOrderItemSerializer(many=True, required=False)

    class Meta:
        model = PurchaseOrder
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'subtotal', 'tax_total', 'grand_total', 'approved_at', 'approved_by']

class GoodsReceiptSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='purchase_order.vendor.name', read_only=True)
    po_number = serializers.CharField(source='purchase_order.po_number', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)

    class Meta:
        model = GoodsReceipt
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

from rest_framework import serializers
from .models import ChartOfAccounts, Invoice, InvoiceItem, VendorInvoice, Payment, GeneralLedger

class ChartOfAccountsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChartOfAccounts
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class InvoiceItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = InvoiceItem
        fields = '__all__'
        read_only_fields = ['id', 'tax_amount', 'total_amount']

class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_code = serializers.CharField(source='customer.customer_code', read_only=True)
    balance_due = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    items = InvoiceItemSerializer(many=True, required=False)

    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'subtotal', 'tax_amount', 'total_amount', 'paid_amount', 'balance_due']

class VendorInvoiceSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    vendor_code = serializers.CharField(source='vendor.vendor_code', read_only=True)
    balance_due = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = VendorInvoice
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'subtotal', 'tax_amount', 'total_amount', 'paid_amount', 'balance_due']

class PaymentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    bill_number = serializers.CharField(source='vendor_invoice.bill_number', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class GeneralLedgerSerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = GeneralLedger
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

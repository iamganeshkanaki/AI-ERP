from django.contrib import admin
from .models import ChartOfAccounts, Invoice, InvoiceItem, VendorInvoice, Payment, GeneralLedger

class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1

@admin.register(ChartOfAccounts)
class ChartOfAccountsAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'account_type', 'is_active')
    list_filter = ('account_type', 'is_active')
    search_fields = ('code', 'name')

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'customer', 'issue_date', 'due_date', 'status', 'total_amount', 'paid_amount')
    list_filter = ('status', 'issue_date')
    search_fields = ('invoice_number', 'customer__name')
    inlines = [InvoiceItemInline]

@admin.register(VendorInvoice)
class VendorInvoiceAdmin(admin.ModelAdmin):
    list_display = ('bill_number', 'vendor', 'issue_date', 'due_date', 'status', 'total_amount', 'paid_amount')
    list_filter = ('status',)
    search_fields = ('bill_number', 'vendor__name')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_number', 'payment_type', 'customer', 'vendor', 'amount', 'payment_date', 'payment_method')
    list_filter = ('payment_type', 'payment_method', 'payment_date')
    search_fields = ('payment_number', 'reference_number')

@admin.register(GeneralLedger)
class GeneralLedgerAdmin(admin.ModelAdmin):
    list_display = ('transaction_date', 'account', 'debit', 'credit', 'reference_type', 'reference_number')
    list_filter = ('reference_type', 'transaction_date')
    search_fields = ('reference_number', 'description')

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ChartOfAccounts, Invoice, InvoiceItem, VendorInvoice, Payment, GeneralLedger
from .serializers import (
    ChartOfAccountsSerializer, InvoiceSerializer, InvoiceItemSerializer,
    VendorInvoiceSerializer, PaymentSerializer, GeneralLedgerSerializer
)
from .permissions import CanManageFinance
from .services import FinanceService

class ChartOfAccountsViewSet(viewsets.ModelViewSet):
    queryset = ChartOfAccounts.objects.all()
    serializer_class = ChartOfAccountsSerializer
    permission_classes = [CanManageFinance]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['account_type', 'is_active']
    search_fields = ['code', 'name']

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('customer', 'sales_order').prefetch_related('items__product').all()
    serializer_class = InvoiceSerializer
    permission_classes = [CanManageFinance]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'customer']
    search_fields = ['invoice_number', 'customer__name', 'notes']
    ordering_fields = ['issue_date', 'due_date', 'total_amount', 'paid_amount']

    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        amount = request.data.get('amount')
        method = request.data.get('payment_method', 'Bank_Transfer')
        ref = request.data.get('reference_number', '')
        notes = request.data.get('notes', '')
        if not amount:
            return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
        payment = FinanceService.process_customer_payment(pk, amount, method, ref, notes)
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        invoices = FinanceService.get_overdue_invoices()
        page = self.paginate_queryset(invoices)
        if page is not None:
            serializer = InvoiceSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = InvoiceSerializer(invoices, many=True)
        return Response(serializer.data)

class InvoiceItemViewSet(viewsets.ModelViewSet):
    queryset = InvoiceItem.objects.select_related('invoice', 'product').all()
    serializer_class = InvoiceItemSerializer
    permission_classes = [CanManageFinance]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['invoice']

    def perform_create(self, serializer):
        item = serializer.save()
        FinanceService.calculate_invoice_totals(item.invoice)

    def perform_update(self, serializer):
        item = serializer.save()
        FinanceService.calculate_invoice_totals(item.invoice)

class VendorInvoiceViewSet(viewsets.ModelViewSet):
    queryset = VendorInvoice.objects.select_related('vendor', 'purchase_order').all()
    serializer_class = VendorInvoiceSerializer
    permission_classes = [CanManageFinance]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'vendor']
    search_fields = ['bill_number', 'vendor__name']

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('customer', 'vendor', 'invoice', 'vendor_invoice').all()
    serializer_class = PaymentSerializer
    permission_classes = [CanManageFinance]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['payment_type', 'payment_method', 'customer', 'vendor']
    search_fields = ['payment_number', 'reference_number']
    ordering_fields = ['payment_date', 'amount']

class GeneralLedgerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GeneralLedger.objects.select_related('account').all()
    serializer_class = GeneralLedgerSerializer
    permission_classes = [CanManageFinance]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['account', 'reference_type']
    search_fields = ['reference_number', 'description']
    ordering_fields = ['transaction_date', 'debit', 'credit']

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Vendor, PurchaseOrder, PurchaseOrderItem, GoodsReceipt
from .serializers import (
    VendorSerializer, PurchaseOrderSerializer,
    PurchaseOrderItemSerializer, GoodsReceiptSerializer
)
from .permissions import CanManageProcurement
from .services import PurchaseService

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [CanManageProcurement]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['vendor_code', 'name', 'contact_person', 'email', 'tax_id']
    ordering_fields = ['name', 'rating', 'created_at']

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.select_related('vendor', 'approved_by').prefetch_related('items__product').all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [CanManageProcurement]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'vendor']
    search_fields = ['po_number', 'vendor__name', 'notes']
    ordering_fields = ['order_date', 'grand_total', 'created_at']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        po = PurchaseService.approve_purchase_order(pk, request.user)
        return Response(PurchaseOrderSerializer(po).data)

    @action(detail=True, methods=['post'])
    def recalculate(self, request, pk=None):
        po = PurchaseOrder.objects.get(pk=pk)
        po = PurchaseService.calculate_po_totals(po)
        return Response(PurchaseOrderSerializer(po).data)

    @action(detail=True, methods=['post'])
    def receive_goods(self, request, pk=None):
        warehouse_id = request.data.get('warehouse_id')
        remarks = request.data.get('remarks', '')
        if not warehouse_id:
            return Response({'error': 'warehouse_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        grn = PurchaseService.process_goods_receipt(pk, warehouse_id, request.user, remarks)
        return Response(GoodsReceiptSerializer(grn).data, status=status.HTTP_201_CREATED)

class PurchaseOrderItemViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrderItem.objects.select_related('purchase_order', 'product').all()
    serializer_class = PurchaseOrderItemSerializer
    permission_classes = [CanManageProcurement]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['purchase_order', 'product']

    def perform_create(self, serializer):
        item = serializer.save()
        PurchaseService.calculate_po_totals(item.purchase_order)

    def perform_update(self, serializer):
        item = serializer.save()
        PurchaseService.calculate_po_totals(item.purchase_order)

class GoodsReceiptViewSet(viewsets.ModelViewSet):
    queryset = GoodsReceipt.objects.select_related('purchase_order__vendor', 'warehouse', 'received_by').all()
    serializer_class = GoodsReceiptSerializer
    permission_classes = [CanManageProcurement]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'warehouse']
    search_fields = ['grn_number', 'purchase_order__po_number']

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import SalesOrder, SalesOrderItem, DeliveryNote
from .serializers import SalesOrderSerializer, SalesOrderItemSerializer, DeliveryNoteSerializer
from .permissions import CanManageSales
from .services import SalesService

class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.select_related('customer', 'assigned_rep').prefetch_related('items__product').all()
    serializer_class = SalesOrderSerializer
    permission_classes = [CanManageSales]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'customer']
    search_fields = ['order_number', 'customer__name', 'notes']
    ordering_fields = ['order_date', 'grand_total', 'created_at']

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        order, approved = SalesService.confirm_sales_order(pk)
        return Response({
            'status': order.status,
            'approved_immediately': approved,
            'order': SalesOrderSerializer(order).data
        })

    @action(detail=True, methods=['post'])
    def recalculate(self, request, pk=None):
        order = SalesOrder.objects.get(pk=pk)
        order = SalesService.calculate_order_totals(order)
        return Response(SalesOrderSerializer(order).data)

    @action(detail=True, methods=['post'])
    def create_delivery(self, request, pk=None):
        carrier = request.data.get('carrier', '')
        tracking = request.data.get('tracking_number', '')
        delivery = SalesService.create_delivery_dispatch(pk, carrier, tracking)
        return Response(DeliveryNoteSerializer(delivery).data, status=status.HTTP_201_CREATED)

class SalesOrderItemViewSet(viewsets.ModelViewSet):
    queryset = SalesOrderItem.objects.select_related('sales_order', 'product').all()
    serializer_class = SalesOrderItemSerializer
    permission_classes = [CanManageSales]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['sales_order', 'product']

    def perform_create(self, serializer):
        item = serializer.save()
        SalesService.calculate_order_totals(item.sales_order)

    def perform_update(self, serializer):
        item = serializer.save()
        SalesService.calculate_order_totals(item.sales_order)

class DeliveryNoteViewSet(viewsets.ModelViewSet):
    queryset = DeliveryNote.objects.select_related('sales_order__customer').all()
    serializer_class = DeliveryNoteSerializer
    permission_classes = [CanManageSales]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status']
    search_fields = ['delivery_number', 'sales_order__order_number', 'tracking_number']

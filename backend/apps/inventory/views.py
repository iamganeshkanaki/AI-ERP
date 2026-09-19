from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Warehouse, ProductCategory, Product, Stock, StockMovement
from .serializers import (
    WarehouseSerializer, ProductCategorySerializer,
    ProductSerializer, StockSerializer, StockMovementSerializer
)
from .permissions import CanManageInventory
from .services import InventoryService

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.select_related('branch__company').all()
    serializer_class = WarehouseSerializer
    permission_classes = [CanManageInventory]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active', 'branch']
    search_fields = ['code', 'name', 'location']

class ProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [CanManageInventory]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').prefetch_related('stocks').all()
    serializer_class = ProductSerializer
    permission_classes = [CanManageInventory]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['sku', 'name', 'hsn_sac_code', 'description']
    ordering_fields = ['name', 'sku', 'unit_price', 'cost_price', 'created_at']

class StockViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Stock.objects.select_related('product__category', 'warehouse').all()
    serializer_class = StockSerializer
    permission_classes = [CanManageInventory]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['warehouse', 'product']
    search_fields = ['product__name', 'product__sku', 'warehouse__name']
    ordering_fields = ['quantity', 'reserved_quantity']

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        stocks = InventoryService.get_low_stock_alerts()
        page = self.paginate_queryset(stocks)
        if page is not None:
            serializer = StockSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = StockSerializer(stocks, many=True)
        return Response(serializer.data)

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.select_related('product', 'warehouse', 'target_warehouse').all()
    serializer_class = StockMovementSerializer
    permission_classes = [CanManageInventory]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['movement_type', 'product', 'warehouse']
    search_fields = ['reference_number', 'product__sku', 'notes']
    ordering_fields = ['created_at', 'quantity']

    def create(self, request, *args, **kwargs):
        data = request.data
        movement = InventoryService.record_movement(
            product_id=data.get('product'),
            warehouse_id=data.get('warehouse'),
            movement_type=data.get('movement_type'),
            quantity=data.get('quantity'),
            reference_number=data.get('reference_number', 'MANUAL-ADJ'),
            target_warehouse_id=data.get('target_warehouse'),
            notes=data.get('notes', '')
        )
        return Response(StockMovementSerializer(movement).data, status=status.HTTP_201_CREATED)

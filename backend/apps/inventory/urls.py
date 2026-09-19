from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WarehouseViewSet, ProductCategoryViewSet,
    ProductViewSet, StockViewSet, StockMovementViewSet
)

router = DefaultRouter()
router.register(r'warehouses', WarehouseViewSet, basename='inv-warehouse')
router.register(r'categories', ProductCategoryViewSet, basename='inv-category')
router.register(r'products', ProductViewSet, basename='inv-product')
router.register(r'stocks', StockViewSet, basename='inv-stock')
router.register(r'movements', StockMovementViewSet, basename='inv-movement')
router.register(r'', StockViewSet, basename='inv-default')

urlpatterns = [
    path('', include(router.urls)),
]

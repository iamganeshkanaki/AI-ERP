from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VendorViewSet, PurchaseOrderViewSet,
    PurchaseOrderItemViewSet, GoodsReceiptViewSet
)

router = DefaultRouter()
router.register(r'vendors', VendorViewSet, basename='purchase-vendor')
router.register(r'orders', PurchaseOrderViewSet, basename='purchase-order')
router.register(r'items', PurchaseOrderItemViewSet, basename='purchase-item')
router.register(r'goods-receipts', GoodsReceiptViewSet, basename='purchase-grn')
router.register(r'', PurchaseOrderViewSet, basename='purchase-default')

urlpatterns = [
    path('', include(router.urls)),
]

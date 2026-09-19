from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalesOrderViewSet, SalesOrderItemViewSet, DeliveryNoteViewSet

router = DefaultRouter()
router.register(r'orders', SalesOrderViewSet, basename='sales-order')
router.register(r'items', SalesOrderItemViewSet, basename='sales-item')
router.register(r'deliveries', DeliveryNoteViewSet, basename='sales-delivery')
router.register(r'', SalesOrderViewSet, basename='sales-default')

urlpatterns = [
    path('', include(router.urls)),
]

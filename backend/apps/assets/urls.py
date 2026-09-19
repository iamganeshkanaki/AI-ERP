from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssetViewSet, AssetMaintenanceViewSet

router = DefaultRouter()
router.register(r'equipment', AssetViewSet, basename='asset')
router.register(r'maintenance', AssetMaintenanceViewSet, basename='asset-maintenance')
router.register(r'', AssetViewSet, basename='asset-default')

urlpatterns = [
    path('', include(router.urls)),
]

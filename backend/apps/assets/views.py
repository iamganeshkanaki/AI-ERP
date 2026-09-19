from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Asset, AssetMaintenance
from .serializers import AssetSerializer, AssetMaintenanceSerializer

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.select_related('branch', 'assigned_employee').all()
    serializer_class = AssetSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'category', 'branch']
    search_fields = ['asset_code', 'name', 'serial_number']

class AssetMaintenanceViewSet(viewsets.ModelViewSet):
    queryset = AssetMaintenance.objects.select_related('asset').all()
    serializer_class = AssetMaintenanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['asset']

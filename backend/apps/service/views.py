from rest_framework import viewsets, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import ServiceTicket, WarrantyRecord
from .serializers import ServiceTicketSerializer, WarrantyRecordSerializer

class ServiceTicketViewSet(viewsets.ModelViewSet):
    queryset = ServiceTicket.objects.select_related('customer', 'assigned_to').all()
    serializer_class = ServiceTicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'customer', 'assigned_to']
    search_fields = ['ticket_number', 'title', 'description']
    ordering_fields = ['created_at', 'priority']

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = 'Resolved'
        ticket.resolution_notes = request.data.get('resolution_notes', '')
        ticket.resolved_at = timezone.now()
        ticket.save(update_fields=['status', 'resolution_notes', 'resolved_at'])
        return Response(ServiceTicketSerializer(ticket).data)

class WarrantyRecordViewSet(viewsets.ModelViewSet):
    queryset = WarrantyRecord.objects.select_related('customer', 'product').all()
    serializer_class = WarrantyRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active', 'product', 'customer']
    search_fields = ['serial_number', 'customer__name']

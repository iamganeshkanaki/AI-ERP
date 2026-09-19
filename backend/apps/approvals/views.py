from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ApprovalRequest, ApprovalAction
from .serializers import ApprovalRequestSerializer, ApprovalActionSerializer
from .services import ApprovalService

class ApprovalRequestViewSet(viewsets.ModelViewSet):
    queryset = ApprovalRequest.objects.select_related('requested_by').prefetch_related('actions__approver').all()
    serializer_class = ApprovalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['module', 'status', 'requested_by']
    search_fields = ['reference_title']
    ordering_fields = ['created_at', 'amount']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        comments = request.data.get('comments', '')
        req = ApprovalService.process_decision(pk, request.user, 'Approved', comments)
        return Response(ApprovalRequestSerializer(req).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        comments = request.data.get('comments', '')
        req = ApprovalService.process_decision(pk, request.user, 'Rejected', comments)
        return Response(ApprovalRequestSerializer(req).data)

    @action(detail=False, methods=['get'])
    def pending_count(self, request):
        count = ApprovalRequest.objects.filter(status='Pending').count()
        return Response({'pending_count': count})

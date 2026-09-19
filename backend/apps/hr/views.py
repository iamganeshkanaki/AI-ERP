from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Attendance, LeaveRequest, PayrollRecord, ExpenseClaim
from .serializers import (
    AttendanceSerializer, LeaveRequestSerializer,
    PayrollRecordSerializer, ExpenseClaimSerializer
)
from .permissions import CanManageHR
from .services import HRService

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('employee__department').all()
    serializer_class = AttendanceSerializer
    permission_classes = [CanManageHR]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'date', 'employee']
    ordering_fields = ['date']

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.select_related('employee', 'approved_by').all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [CanManageHR]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'leave_type', 'employee']
    search_fields = ['employee__first_name', 'employee__last_name', 'reason']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave = HRService.approve_leave_request(pk, request.user)
        return Response(LeaveRequestSerializer(leave).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        reason = request.data.get('reason', '')
        leave = HRService.reject_leave_request(pk, request.user, reason)
        return Response(LeaveRequestSerializer(leave).data)

class PayrollRecordViewSet(viewsets.ModelViewSet):
    queryset = PayrollRecord.objects.select_related('employee__department').all()
    serializer_class = PayrollRecordSerializer
    permission_classes = [CanManageHR]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['month', 'year', 'status', 'employee']
    ordering_fields = ['year', 'month', 'net_salary']

class ExpenseClaimViewSet(viewsets.ModelViewSet):
    queryset = ExpenseClaim.objects.select_related('employee', 'approved_by').all()
    serializer_class = ExpenseClaimSerializer
    permission_classes = [CanManageHR]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'category', 'employee']
    search_fields = ['claim_title', 'employee__first_name']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        claim = HRService.approve_expense_claim(pk, request.user)
        return Response(ExpenseClaimSerializer(claim).data)

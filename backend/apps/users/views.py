from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Company, Branch, Department, Employee, User
from .serializers import (
    CompanySerializer, BranchSerializer, DepartmentSerializer,
    EmployeeSerializer, UserSerializer, UserCreateUpdateSerializer
)
from .permissions import CanManageUsers, CanViewUsers

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [CanManageUsers]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'tax_id']
    ordering_fields = ['name', 'created_at']

class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.select_related('company').all()
    serializer_class = BranchSerializer
    permission_classes = [CanViewUsers]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['company', 'is_active', 'city']
    search_fields = ['name', 'code', 'city']

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.select_related('branch', 'manager').all()
    serializer_class = DepartmentSerializer
    permission_classes = [CanViewUsers]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['branch', 'branch__company']
    search_fields = ['name', 'code']

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related('department__branch__company', 'reporting_manager').all()
    serializer_class = EmployeeSerializer
    permission_classes = [CanViewUsers]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'status', 'designation']
    search_fields = ['first_name', 'last_name', 'email', 'employee_id']
    ordering_fields = ['hire_date', 'salary', 'first_name']

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('company', 'employee').all()
    permission_classes = [CanManageUsers]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'company', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'email']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateUpdateSerializer
        return UserSerializer

    @action(detail=False, methods=['get'], permission_classes=[CanViewUsers])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

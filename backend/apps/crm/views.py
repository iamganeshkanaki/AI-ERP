from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Customer, Lead, Opportunity
from .serializers import CustomerSerializer, LeadSerializer, OpportunitySerializer
from .permissions import CanManageCRM
from .services import CRMService

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.select_related('account_manager').all()
    serializer_class = CustomerSerializer
    permission_classes = [CanManageCRM]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'industry']
    search_fields = ['customer_code', 'name', 'email', 'contact_person', 'tax_number']
    ordering_fields = ['name', 'created_at', 'credit_limit', 'current_balance']

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.select_related('assigned_to', 'converted_customer').all()
    serializer_class = LeadSerializer
    permission_classes = [CanManageCRM]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'source', 'assigned_to']
    search_fields = ['name', 'company_name', 'email', 'phone']
    ordering_fields = ['created_at', 'estimated_value']

    @action(detail=True, methods=['post'])
    def convert(self, request, pk=None):
        customer = CRMService.convert_lead_to_customer(pk)
        return Response(CustomerSerializer(customer).data, status=status.HTTP_201_CREATED)

class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.select_related('customer', 'owner').all()
    serializer_class = OpportunitySerializer
    permission_classes = [CanManageCRM]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['stage', 'customer', 'owner']
    search_fields = ['title', 'customer__name']
    ordering_fields = ['expected_revenue', 'target_close_date', 'probability_percentage']

    @action(detail=False, methods=['get'])
    def metrics(self, request):
        metrics = CRMService.get_pipeline_metrics()
        return Response(metrics)

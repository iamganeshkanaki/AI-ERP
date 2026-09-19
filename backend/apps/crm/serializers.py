from rest_framework import serializers
from .models import Customer, Lead, Opportunity

class CustomerSerializer(serializers.ModelSerializer):
    account_manager_name = serializers.CharField(source='account_manager.get_full_name', read_only=True)
    open_opportunities_count = serializers.IntegerField(source='opportunities.count', read_only=True)

    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'current_balance']

class LeadSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)

    class Meta:
        model = Lead
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class OpportunitySerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    weighted_revenue = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = Opportunity
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'weighted_revenue']

from rest_framework import serializers
from .models import ApprovalRequest, ApprovalAction

class ApprovalActionSerializer(serializers.ModelSerializer):
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)

    class Meta:
        model = ApprovalAction
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'action_date']

class ApprovalRequestSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    actions = ApprovalActionSerializer(many=True, read_only=True)

    class Meta:
        model = ApprovalRequest
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'current_step', 'status']

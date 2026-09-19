from rest_framework import serializers
from .models import AIConversation, AIMessage, AIAuditLog

class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class AIConversationSerializer(serializers.ModelSerializer):
    messages = AIMessageSerializer(many=True, read_only=True)

    class Meta:
        model = AIConversation
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']

class AIAuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = AIAuditLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

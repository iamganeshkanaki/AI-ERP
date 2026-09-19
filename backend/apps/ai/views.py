from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import AIConversation, AIMessage, AIAuditLog
from .serializers import AIConversationSerializer, AIMessageSerializer, AIAuditLogSerializer
from .services import AIAgentService

class AIConversationViewSet(viewsets.ModelViewSet):
    serializer_class = AIConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AIChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        prompt = request.data.get('prompt')
        conversation_id = request.data.get('conversation_id')

        if not prompt:
            return Response({'error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not conversation_id:
            conv = AIConversation.objects.create(
                user=request.user,
                title=prompt[:40] + ('...' if len(prompt) > 40 else '')
            )
            conversation_id = conv.id

        message = AIAgentService.handle_user_query(conversation_id, prompt, request.user)
        return Response({
            'conversation_id': conversation_id,
            'message': AIMessageSerializer(message).data
        })

class AIToolExecutionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        tool_name = request.data.get('tool_name')
        args = request.data.get('args', {})
        if not tool_name:
            return Response({'error': 'tool_name is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = AIAgentService.execute_tool(tool_name, args, request.user)
            return Response({'result': result})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AIAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AIAuditLog.objects.select_related('user').all()
    serializer_class = AIAuditLogSerializer
    permission_classes = [permissions.IsAdminUser]

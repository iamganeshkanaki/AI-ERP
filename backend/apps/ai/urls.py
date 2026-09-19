from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AIConversationViewSet, AIChatView, AIToolExecutionView, AIAuditLogViewSet

router = DefaultRouter()
router.register(r'conversations', AIConversationViewSet, basename='ai-conversation')
router.register(r'audit-logs', AIAuditLogViewSet, basename='ai-audit-log')

urlpatterns = [
    path('chat/', AIChatView.as_view(), name='ai-chat'),
    path('execute-tool/', AIToolExecutionView.as_view(), name='ai-execute-tool'),
    path('', include(router.urls)),
]

from django.db import models
from apps.core.models import AuditableModel, TimeStampedModel
from apps.users.models import User

class AIConversation(AuditableModel):
    """Multi-turn context session between an ERP operator and Nexus Copilot."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_conversations')
    title = models.CharField(max_length=255, default='New ERP Conversation')
    context_module = models.CharField(max_length=50, default='General')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.title}"

class AIMessage(TimeStampedModel):
    """Single prompt or response turn with structured tool calls."""
    ROLE_CHOICES = (
        ('user', 'User'),
        ('assistant', 'Nexus Assistant'),
        ('system', 'System Context'),
        ('tool', 'Tool Execution Result'),
    )

    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    tool_calls = models.JSONField(null=True, blank=True)
    tool_results = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.role}] {self.content[:60]}..."

class AIAuditLog(TimeStampedModel):
    """Immutable compliance ledger of every AI tool execution."""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    prompt = models.TextField()
    tool_name = models.CharField(max_length=100)
    tool_arguments = models.JSONField(default=dict)
    authorized = models.BooleanField(default=False)
    execution_result = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} invoked {self.tool_name} (Auth={self.authorized})"

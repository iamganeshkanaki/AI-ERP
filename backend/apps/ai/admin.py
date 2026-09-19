from django.contrib import admin
from .models import AIConversation, AIMessage, AIAuditLog

class MessageInline(admin.TabularInline):
    model = AIMessage
    extra = 0

@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'context_module', 'created_at')
    list_filter = ('context_module',)
    search_fields = ('title', 'user__email')
    inlines = [MessageInline]

@admin.register(AIAuditLog)
class AIAuditLogAdmin(admin.ModelAdmin):
    list_display = ('tool_name', 'user', 'authorized', 'created_at')
    list_filter = ('tool_name', 'authorized', 'created_at')
    search_fields = ('tool_name', 'prompt', 'user__email')

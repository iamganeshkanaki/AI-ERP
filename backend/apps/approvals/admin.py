from django.contrib import admin
from .models import ApprovalRequest, ApprovalAction

class ApprovalActionInline(admin.TabularInline):
    model = ApprovalAction
    extra = 0
    readonly_fields = ('step_number', 'approver', 'action', 'comments', 'action_date')

@admin.register(ApprovalRequest)
class ApprovalRequestAdmin(admin.ModelAdmin):
    list_display = ('reference_title', 'module', 'requested_by', 'amount', 'status', 'current_step', 'created_at')
    list_filter = ('module', 'status')
    search_fields = ('reference_title',)
    inlines = [ApprovalActionInline]

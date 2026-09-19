from django.contrib import admin
from .models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('document_code', 'title', 'category', 'version', 'is_confidential', 'uploaded_by', 'created_at')
    list_filter = ('category', 'is_confidential')
    search_fields = ('document_code', 'title', 'tags')

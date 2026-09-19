from django.db import models
from apps.core.models import AuditableModel
from apps.users.models import User

class Document(AuditableModel):
    """Secure enterprise document repository."""
    CATEGORY_CHOICES = (
        ('Contract', 'Client / Vendor Legal Contract'),
        ('Tax_Invoice', 'Tax Invoice / Delivery Bill'),
        ('Compliance', 'Regulatory & Compliance Policy'),
        ('Technical', 'Technical Drawing / Engineering Spec'),
        ('HR_Doc', 'Employment Letter / NDA'),
    )

    document_code = models.CharField(max_length=50, unique=True, db_index=True)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='Contract')
    file = models.FileField(upload_to='documents/%Y/%m/', blank=True, null=True)
    file_url = models.URLField(blank=True, help_text="External or S3/GCS asset URL")
    version = models.PositiveSmallIntegerField(default=1)
    is_confidential = models.BooleanField(default=False)
    tags = models.CharField(max_length=255, blank=True, help_text="Comma-separated labels")
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.document_code} - {self.title} (v{self.version})"

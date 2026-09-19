from django.db import models
from apps.core.models import TimeStampedModel
from apps.users.models import User

class Notification(TimeStampedModel):
    """System and operational event notification."""
    TYPE_CHOICES = (
        ('Info', 'Information'),
        ('Warning', 'Warning / Action Required'),
        ('Success', 'Success'),
        ('Error', 'Critical Alert'),
        ('AI', 'AI Copilot Insight'),
    )

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Info')
    module = models.CharField(max_length=50, blank=True)
    link_url = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] {self.title} for {self.recipient.email}"

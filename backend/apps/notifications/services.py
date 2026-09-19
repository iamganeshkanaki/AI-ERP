from django.utils import timezone
from .models import Notification

class NotificationService:
    @staticmethod
    def notify_user(recipient, title, message, notification_type='Info', module='', link_url=''):
        return Notification.objects.create(
            recipient=recipient,
            title=title,
            message=message,
            notification_type=notification_type,
            module=module,
            link_url=link_url
        )

    @staticmethod
    def mark_as_read(notification_id, user):
        notif = Notification.objects.get(id=notification_id, recipient=user)
        notif.is_read = True
        notif.read_at = timezone.now()
        notif.save(update_fields=['is_read', 'read_at'])
        return notif

    @staticmethod
    def mark_all_as_read(user):
        Notification.objects.filter(recipient=user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )

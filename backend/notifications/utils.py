from .models import Notification

def create_notification(recipient, sender, notification_type, message, related_post=None):
    return Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        message=message,
        related_post=related_post
    )
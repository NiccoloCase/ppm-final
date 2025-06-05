from .models import Notification

def create_notification(recipient, sender, notification_type, message, related_post=None):
    return Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        message=message,
        related_post=related_post
    )


def create_follow_notification(follower, followed_user):
    Notification.objects.create(
        recipient=followed_user,
        sender=follower,
        notification_type='follow',
        message=f'{follower.username} started following you'
    )

def remove_follow_notification(follower, followed_user):
    Notification.objects.filter(
        recipient=followed_user,
        sender=follower,
        notification_type='follow'
    ).delete()
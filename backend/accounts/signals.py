from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Follow

@receiver(post_save, sender=Follow)
def create_follow_notification_signal(sender, instance, created, **kwargs):
    if created:
        from notifications.utils import create_follow_notification
        create_follow_notification(instance.follower, instance.following)

@receiver(post_delete, sender=Follow)
def remove_follow_notification_signal(sender, instance, **kwargs):
    from notifications.utils import remove_follow_notification
    remove_follow_notification(instance.follower, instance.following)
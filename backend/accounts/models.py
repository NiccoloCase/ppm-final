from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)

    following_users = models.ManyToManyField(
        'self',
        through='Follow',
        through_fields=('follower', 'following'),
        symmetrical=False,
        related_name='followers_users'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        indexes = [
            models.Index(fields=['username']),  # For username lookups
            models.Index(fields=['email']),  # For email authentication
            models.Index(fields=['-created_at']),  # For ordering by join date
            models.Index(fields=['is_active']),  # For active user queries
        ]

    def __str__(self):
        return self.username

    @property
    def following_count(self):
        return self.following_users.count()

    @property
    def followers_count(self):
        return self.followers_users.count()

class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='following_set', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='followers_set', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
        constraints = [
            models.CheckConstraint(
                check=~models.Q(follower=models.F('following')),
                name='no_self_follow'
            )
        ]
        indexes = [
            models.Index(fields=['follower']),
            models.Index(fields=['following']),
            models.Index(fields=['follower', 'following'])
        ]

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"
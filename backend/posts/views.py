from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Post, Comment, Like
from .serializers import PostSerializer, CommentSerializer, LikeSerializer
from accounts.models import Follow
#from notifications.utils import create_notification TODO


# Custom Permission Classes for Different User Groups
class IsVerifiedUser(permissions.BasePermission):
    """
    Permission class for verified users (staff members or users with premium features).
    Only verified users can create posts with images.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        # Allow verified users (staff) to create posts with images
        if request.method == 'POST' and request.data.get('image'):
            return request.user.is_staff or hasattr(request.user, 'is_verified')

        return True


class IsRegularUserOrReadOnly(permissions.BasePermission):
    """
    Permission class for regular users.
    Regular users can only read content and create text-only posts.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        # Regular users can read everything
        if request.method in permissions.SAFE_METHODS:
            return True

        # Regular users can create posts but not with images
        if request.method == 'POST':
            if request.data.get('image') and not request.user.is_staff:
                return False
            return True

        return True

    def has_object_permission(self, request, view, obj):
        # Read permissions for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions only to the owner of the object
        return obj.author == request.user


class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsVerifiedUser]  # Using custom permission for verified users

    def get_queryset(self):
        # Show posts from followed users and own posts
        following_users = Follow.objects.filter(follower=self.request.user).values_list('following', flat=True)
        return Post.objects.filter(author__in=list(following_users) + [self.request.user.id])


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsRegularUserOrReadOnly]  # Using custom permission for regular users


class UserPostsView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsRegularUserOrReadOnly]  # Using custom permission for regular users

    def get_queryset(self):
        username = self.kwargs['username']
        return Post.objects.filter(author__username=username)


class PostCommentsView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsRegularUserOrReadOnly]  # Using custom permission for regular users

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post_id=post_id)

    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        post = get_object_or_404(Post, id=post_id)
        comment = serializer.save(post=post)

        # Create notification for post author
        if post.author != self.request.user:
            create_notification(
                recipient=post.author,
                sender=self.request.user,
                notification_type='comment',
                message=f'{self.request.user.username} commented on your post',
                related_post=post
            )


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsRegularUserOrReadOnly]  # Using custom permission for regular users


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def like_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    like, created = Like.objects.get_or_create(post=post, user=request.user)

    if created:
        # Create notification for post author
        if post.author != request.user:
            create_notification(
                recipient=post.author,
                sender=request.user,
                notification_type='like',
                message=f'{request.user.username} liked your post',
                related_post=post
            )
        return Response({'message': 'Post liked successfully'})
    else:
        return Response({'message': 'Post already liked'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unlike_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    try:
        like = Like.objects.get(post=post, user=request.user)
        like.delete()
        return Response({'message': 'Post unliked successfully'})
    except Like.DoesNotExist:
        return Response({'error': 'Post not liked'}, status=status.HTTP_400_BAD_REQUEST)


class PostLikesView(generics.ListAPIView):
    serializer_class = LikeSerializer
    permission_classes = [IsRegularUserOrReadOnly]  # Using custom permission for regular users

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Like.objects.filter(post_id=post_id)


# Keep the original IsAuthorOrReadOnly for backwards compatibility
class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user

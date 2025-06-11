from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Post, Comment, Like
from .serializers import PostSerializer, CommentSerializer, LikeSerializer
from accounts.models import Follow
from notifications.utils import create_notification


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
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.author == request.user


class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsVerifiedUser]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        following_users = Follow.objects.filter(follower=self.request.user).values_list('following', flat=True)
        return Post.objects.filter(
            author__in=list(following_users) + [self.request.user.id]
        ).select_related('author').prefetch_related('likes')


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsRegularUserOrReadOnly]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Post.objects.select_related('author').prefetch_related('likes')


class UserPostsView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsRegularUserOrReadOnly]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        username = self.kwargs['username']
        return Post.objects.filter(
            author__username=username
        ).select_related('author').prefetch_related('likes')


class PostCommentsView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsRegularUserOrReadOnly]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post_id=post_id).select_related('author')

    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        post = get_object_or_404(Post, id=post_id)
        comment = serializer.save(post=post)

        if post.author != self.request.user:
            create_notification(
                recipient=post.author,
                sender=self.request.user,
                notification_type='comment',
                message=f'{self.request.user.username} ha commentato il tuo post',
                related_post=post
            )


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsRegularUserOrReadOnly]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Comment.objects.select_related('author')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@authentication_classes([JWTAuthentication])
def like_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    like, created = Like.objects.get_or_create(post=post, user=request.user)

    if created:
        if post.author != request.user:
            create_notification(
                recipient=post.author,
                sender=request.user,
                notification_type='like',
                message=f'A {request.user.username} piace il tuo post',
                related_post=post
            )
        return Response({'message': 'Post liked successfully'})
    else:
        return Response({'message': 'Post already liked'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@authentication_classes([JWTAuthentication])
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
    permission_classes = [IsRegularUserOrReadOnly]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Like.objects.filter(post_id=post_id).select_related('user')


class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user
from tokenize import TokenError

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.shortcuts import get_object_or_404
from .models import User, Follow
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer,
    UserProfileSerializer, FollowSerializer
)
# from notifications.utils import create_notification TODO


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class UserLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    authentication_classes = [JWTAuthentication]  # Explicit authentication
    permission_classes = [IsAuthenticated]  # Explicit permissions
    queryset = User.objects.all()  # Add this line

    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        # Add debugging to see what's happening
        print(f"Request user: {request.user}")
        print(f"Is authenticated: {request.user.is_authenticated}")
        print(f"Auth header: {request.META.get('HTTP_AUTHORIZATION', 'Not provided')}")

        return super().get(request, *args, **kwargs)


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = 'username'


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def follow_user(request, username):
    user_to_follow = get_object_or_404(User, username=username)

    if user_to_follow == request.user:
        return Response({'error': 'Cannot follow yourself'},
                        status=status.HTTP_400_BAD_REQUEST)

    follow, created = Follow.objects.get_or_create(
        follower=request.user,
        following=user_to_follow
    )

    if created:
       # TODO
       # create_notification(
       #     recipient=user_to_follow,
       #     sender=request.user,
       #     notification_type='follow',
       #     message=f'{request.user.username} started following you'
       # )
        return Response({'message': 'User followed successfully'})
    else:
        return Response({'message': 'Already following this user'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unfollow_user(request, username):
    user_to_unfollow = get_object_or_404(User, username=username)

    try:
        follow = Follow.objects.get(follower=request.user, following=user_to_unfollow)
        follow.delete()
        return Response({'message': 'User unfollowed successfully'})
    except Follow.DoesNotExist:
        return Response({'error': 'Not following this user'}, status=status.HTTP_400_BAD_REQUEST)


class FollowersListView(generics.ListAPIView):
    serializer_class = FollowSerializer

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_object_or_404(User, username=username)
        return Follow.objects.filter(following=user)


class FollowingListView(generics.ListAPIView):
    serializer_class = FollowSerializer

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_object_or_404(User, username=username)
        return Follow.objects.filter(follower=user)



from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from .models import User, Follow
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer,
    UserProfileSerializer, FollowSerializer
)

from posts.models import Post


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

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
    permission_classes = [AllowAny]

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
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_object(self):
        return self.request.user


class UserDetailView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    lookup_field = 'username'
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return User.objects.all()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def follow_user(request, username):
    target_user = get_object_or_404(User, username=username)
    if target_user == request.user:
        return Response({'error': 'Cannot follow yourself'},status=status.HTTP_400_BAD_REQUEST)

    follow, created = Follow.objects.get_or_create(
        follower=request.user, following=target_user
    )

    message = 'User followed successfully' if created else 'Already following this user'

    return Response({
        'message': message,
        'user': UserProfileSerializer(target_user, context={'request': request}).data,
        'followed': True
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def unfollow_user(request, username):
    target_user = get_object_or_404(User, username=username)

    try:
        Follow.objects.get(follower=request.user, following=target_user).delete()

        return Response({
            'message': 'User unfollowed successfully',
            'user': UserProfileSerializer(target_user, context={'request': request}).data,
            'followed': False
        })
    except Follow.DoesNotExist:
        return Response({'error': 'Not following this user'},
                        status=status.HTTP_400_BAD_REQUEST)


class FollowersListView(generics.ListAPIView):
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs['username'])
        return Follow.objects.filter(following=user).select_related('follower', 'following')


class FollowingListView(generics.ListAPIView):
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs['username'])
        return Follow.objects.filter(follower=user).select_related('follower', 'following')


class AllUsersListView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id).order_by('username')


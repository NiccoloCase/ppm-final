from rest_framework import serializers
from .models import Post, Comment, Like
from accounts.serializers import UserProfileSerializer

class PostSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    likes_count = serializers.ReadOnlyField()
    comments_count = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('id', 'author', 'content', 'image', 'likes_count',
                 'comments_count', 'is_liked', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(post=obj, user=request.user).exists()
        return False

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class CommentSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'post', 'author', 'content', 'created_at', 'updated_at')
        read_only_fields = ('post', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class LikeSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = Like
        fields = ('id', 'post', 'user', 'created_at')
        read_only_fields = ('post', 'created_at')

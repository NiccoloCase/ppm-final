from django.urls import path
from . import views

urlpatterns = [
    path('', views.PostListCreateView.as_view(), name='post_list_create'),
    path('<int:pk>/', views.PostDetailView.as_view(), name='post_detail'),
    path('users/<str:username>/', views.UserPostsView.as_view(), name='user_posts'),
    path('<int:post_id>/comments/', views.PostCommentsView.as_view(), name='post_comments'),
    path('comments/<int:pk>/', views.CommentDetailView.as_view(), name='comment_detail'),
    path('<int:post_id>/like/', views.like_post, name='like_post'),
    path('<int:post_id>/unlike/', views.unlike_post, name='unlike_post'),
    path('<int:post_id>/likes/', views.PostLikesView.as_view(), name='post_likes'),
]

from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Profile, Post, Comment, Notification

from .serializers import (
    UserSerializer,
    ProfileSerializer,
    PostSerializer,
    CommentSerializer,
    RegisterSerializer,
    NotificationSerializer,
)


def home(request):
    return JsonResponse({
        "message": "Welcome to Social Media Platform API",
        "status": "success"
    })


@api_view(["GET"])
def health_check(request):
    return Response({
        "status": "ok",
        "message": "Django API is working"
    })


@api_view(["POST"])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        return Response(
            {
                "message": "User registered successfully",
                "username": user.username,
                "user_id": user.id,
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(
        username=username,
        password=password
    )

    if user is None:
        return Response(
            {"error": "Invalid username or password"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)

    return Response({
        "message": "Login successful",
        "username": user.username,
        "user_id": user.id,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def change_username(request):
    new_username = request.data.get("username", "").strip()

    if not new_username:
        return Response(
            {"error": "Username cannot be empty."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=new_username).exclude(
        id=request.user.id
    ).exists():
        return Response(
            {"error": "This username is already taken."},
            status=status.HTTP_400_BAD_REQUEST
        )

    request.user.username = new_username
    request.user.save()

    return Response({
        "message": "Username changed successfully.",
        "username": request.user.username
    })
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.GET.get("q", "").strip()

    if not query:
        return Response([])

    users = User.objects.filter(
        username__icontains=query
    ).exclude(
        id=request.user.id
    )

    serializer = UserSerializer(users, many=True)

    return Response(serializer.data)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def follow_user(request, user_id):
    if request.user.id == user_id:
        return Response(
            {"error": "You cannot follow yourself."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user_to_follow = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    profile = user_to_follow.profile

    if profile.followers.filter(id=request.user.id).exists():
        profile.followers.remove(request.user)
        following = False
    else:
        profile.followers.add(request.user)
        following = True

    return Response({
        "message": "User followed." if following else "User unfollowed.",
        "following": following,
        "followers": profile.followers.count()
    })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by("-created_at")
    serializer_class = PostSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

        def perform_update(self, serializer): 
            post = self.get_object()

            if post.author != self.request.user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied(
                  "You can only edit your own posts." 
                )


def perform_destroy(self, instance):
        if instance.author != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "You can only delete your own posts."
            )

        instance.delete()          


    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response(
            {"error": "Post not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    user = request.user

    if post.likes.filter(id=user.id).exists():
        post.likes.remove(user)
        liked = False

    else:
        post.likes.add(user)
        liked = True

        # Create a notification for the post owner
        if post.author != user:
            Notification.objects.create(
                recipient=post.author,
                sender=user,
                notification_type="like",
                post=post,
                message=f"{user.username} liked your post."
            )

    return Response({
        "message": "Post liked" if liked else "Post unliked",
        "liked": liked,
        "likes": post.likes.count()
    })

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by("-created_at")
    serializer_class = CommentSerializer

    def perform_create(self, serializer):
        comment = serializer.save(
            author=self.request.user
        )

        # Create notification for the post owner
        if comment.post.author != self.request.user:
            Notification.objects.create(
                recipient=comment.post.author,
                sender=self.request.user,
                notification_type="comment",
                post=comment.post,
                message=f"{self.request.user.username} commented on your post."
            )


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by("-created_at")

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()
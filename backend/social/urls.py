from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    UserViewSet,
    ProfileViewSet,
    PostViewSet,
    CommentViewSet,
    NotificationViewSet,
    register,
    login,
    health_check,
    like_post,
    change_username,
    search_users,
    follow_user,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


router = DefaultRouter()

router.register("users", UserViewSet)
router.register("profiles", ProfileViewSet)
router.register("posts", PostViewSet)
router.register("comments", CommentViewSet)
router.register(
    "notifications",
    NotificationViewSet,
    basename="notification"
)
urlpatterns = [
    path("health/", health_check, name="health"),
    path("register/", register, name="register"),
    path("login/", login, name="login"),

 path(
        "change-username/",
        change_username,
        name="change_username"
    ),

    path(
    "search-users/",
    search_users,
    name="search_users"
),
    path(
    "follow-user/<int:user_id>/",
    follow_user,
    name="follow_user"
),
    path(
        "posts/<int:post_id>/like/",
        like_post,
        name="like-post"
    ),

    path(
        "token/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair"
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),

    path("", include(router.urls)),
]

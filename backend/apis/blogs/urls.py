from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogViewSet, KeywordLinkViewSet

router = DefaultRouter()
router.register(r'keywords', KeywordLinkViewSet, basename='keyword')
router.register(r'', BlogViewSet, basename='blog')

urlpatterns = [
    path('', include(router.urls)),
]


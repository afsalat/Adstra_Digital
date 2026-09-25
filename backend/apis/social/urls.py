from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apis.social.views import (
    SocialDashboardView,
    SocialClientProfileViewSet,
    SocialAccountViewSet,
    SocialPostViewSet,
    PublicClientReviewView,
    SocialMediaAssetViewSet,
    SocialCampaignViewSet,
    SocialInboxViewSet,
    SocialAnalyticsView,
    SocialAIView,
    PlatformConnectionViewSet,
    CampaignPublishingViewSet,
)

router = DefaultRouter()
router.register(r'clients', SocialClientProfileViewSet, basename='social-clients')
router.register(r'accounts', SocialAccountViewSet, basename='social-accounts')
router.register(r'posts', SocialPostViewSet, basename='social-posts')
router.register(r'media', SocialMediaAssetViewSet, basename='social-media')
router.register(r'campaigns', SocialCampaignViewSet, basename='social-campaigns')
router.register(r'inbox', SocialInboxViewSet, basename='social-inbox')
router.register(r'platform-connections', PlatformConnectionViewSet, basename='platform-connections')
router.register(r'ad/platform-connections', PlatformConnectionViewSet, basename='ad-platform-connections')
router.register(r'ad', CampaignPublishingViewSet, basename='campaign-publishing')

urlpatterns = [
    path('dashboard/', SocialDashboardView.as_view(), name='social-dashboard'),
    path('analytics/', SocialAnalyticsView.as_view(), name='social-analytics'),
    path('ai/', SocialAIView.as_view(), name='social-ai'),
    path('review/<str:token>/', PublicClientReviewView.as_view(), name='social-public-review'),
    path('', include(router.urls)),
]

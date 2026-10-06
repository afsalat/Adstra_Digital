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
    MistakeInsightsView,
    MistakeFixApplyView,
    SocialMentionsView,
    SocialTeamMembersView,
)
from apis.social.planning_views import (
    ContentPackageViewSet,
    ContentPlanViewSet,
    ContentPlanItemViewSet,
    KeyDateViewSet,
    ProductionVendorViewSet,
    ShootScheduleViewSet,
    ContentIdeaViewSet,
    PlanWorkloadView,
    PublicPlanReviewView,
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
router.register(r'plan-packages', ContentPackageViewSet, basename='social-plan-packages')
router.register(r'plans', ContentPlanViewSet, basename='social-plans')
router.register(r'plan-items', ContentPlanItemViewSet, basename='social-plan-items')
router.register(r'key-dates', KeyDateViewSet, basename='social-key-dates')
router.register(r'vendors', ProductionVendorViewSet, basename='social-vendors')
router.register(r'shoots', ShootScheduleViewSet, basename='social-shoots')
router.register(r'ideas', ContentIdeaViewSet, basename='social-ideas')

urlpatterns = [
    path('dashboard/', SocialDashboardView.as_view(), name='social-dashboard'),
    path('analytics/', SocialAnalyticsView.as_view(), name='social-analytics'),
    path('insights/mistakes/', MistakeInsightsView.as_view(), name='social-mistake-insights'),
    path('insights/apply-fix/', MistakeFixApplyView.as_view(), name='social-mistake-apply-fix'),
    path('ai/', SocialAIView.as_view(), name='social-ai'),
    path('mentions/', SocialMentionsView.as_view(), name='social-mentions'),
    path('team-members/', SocialTeamMembersView.as_view(), name='social-team-members'),
    path('review/<str:token>/', PublicClientReviewView.as_view(), name='social-public-review'),
    path('plan-review/<str:token>/', PublicPlanReviewView.as_view(), name='social-public-plan-review'),
    path('plan-workload/', PlanWorkloadView.as_view(), name='social-plan-workload'),
    path('', include(router.urls)),
]

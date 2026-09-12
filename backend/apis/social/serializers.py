from rest_framework import serializers
from apis.social.models import (
    SocialClientProfile,
    SocialAccount,
    SocialCampaign,
    SocialMediaAsset,
    SocialPost,
    PostApprovalHistory,
    SocialInboxMessage,
    SocialDailyAnalytics,
)
from apis.user.models import CustomUser


class UserMiniSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'fullname', 'name', 'role']

    def get_name(self, obj):
        return getattr(obj, 'fullname', '') or getattr(obj, 'username', '')


class SocialClientProfileSerializer(serializers.ModelSerializer):
    accounts_count = serializers.IntegerField(source='accounts.count', read_only=True)
    posts_count = serializers.IntegerField(source='posts.count', read_only=True)
    pending_approvals_count = serializers.SerializerMethodField()

    class Meta:
        model = SocialClientProfile
        fields = '__all__'

    def get_pending_approvals_count(self, obj):
        return obj.posts.filter(status__in=['internal_review', 'client_review']).count()


class SocialAccountSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client_profile.name', read_only=True)
    platform_display = serializers.CharField(source='get_platform_display', read_only=True)

    class Meta:
        model = SocialAccount
        fields = '__all__'


class SocialCampaignSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client_profile.name', read_only=True)
    posts_count = serializers.IntegerField(source='posts.count', read_only=True)

    class Meta:
        model = SocialCampaign
        fields = '__all__'


class SocialMediaAssetSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client_profile.name', read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = SocialMediaAsset
        fields = '__all__'

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return getattr(obj.uploaded_by, 'fullname', '') or obj.uploaded_by.username
        return 'System'


class PostApprovalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PostApprovalHistory
        fields = '__all__'


class SocialPostSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client_profile.name', read_only=True)
    client_primary_color = serializers.CharField(source='client_profile.primary_color', read_only=True)
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    approval_history = PostApprovalHistorySerializer(many=True, read_only=True)
    created_by_details = UserMiniSerializer(source='created_by', read_only=True)
    assigned_to_details = UserMiniSerializer(source='assigned_to', read_only=True)

    class Meta:
        model = SocialPost
        fields = '__all__'


class SocialInboxMessageSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client_profile.name', read_only=True)
    account_name = serializers.CharField(source='account.account_name', read_only=True)
    converted_lead_number = serializers.CharField(source='converted_lead.lead_number', read_only=True)

    class Meta:
        model = SocialInboxMessage
        fields = '__all__'


class SocialDailyAnalyticsSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client_profile.name', read_only=True)

    class Meta:
        model = SocialDailyAnalytics
        fields = '__all__'

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
    creative_image_url = serializers.CharField(required=False, allow_blank=True)
    creative_video_url = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = SocialCampaign
        fields = '__all__'

    def validate_creative_image_url(self, value):
        if value and value.startswith('data:') and len(value) > 1000:
            return ''
        return value

    def validate_creative_video_url(self, value):
        if value and value.startswith('data:') and len(value) > 1000:
            return ''
        return value


class SocialMediaAssetSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client_profile.name', read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = SocialMediaAsset
        fields = '__all__'

    def to_internal_value(self, data):
        # Do not call data.copy() on QueryDict to avoid deepcopy pickling errors on open files (BufferedRandom)
        if hasattr(data, 'dict'):
            data = data.dict()
        elif hasattr(data, 'copy'):
            try:
                data = data.copy()
            except Exception:
                data = dict(data)
        else:
            data = dict(data)

        # Auto-detect file size if a file is present
        file_obj = data.get('file')
        if file_obj and hasattr(file_obj, 'size') and not data.get('file_size_bytes'):
            data['file_size_bytes'] = file_obj.size

        size_val = data.get('file_size_bytes')
        if size_val is not None:
            if isinstance(size_val, str):
                import re
                if size_val.isdigit():
                    data['file_size_bytes'] = int(size_val)
                else:
                    match = re.search(r'([\d.]+)', size_val)
                    if match:
                        num = float(match.group(1))
                        lower = size_val.lower()
                        if 'gb' in lower:
                            data['file_size_bytes'] = int(num * 1024 * 1024 * 1024)
                        elif 'mb' in lower:
                            data['file_size_bytes'] = int(num * 1024 * 1024)
                        elif 'kb' in lower:
                            data['file_size_bytes'] = int(num * 1024)
                        else:
                            data['file_size_bytes'] = int(num)
                    else:
                        data['file_size_bytes'] = 0
            elif isinstance(size_val, (int, float)):
                data['file_size_bytes'] = int(size_val)
        return super().to_internal_value(data)

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

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        urls = ret.get('media_urls') or []
        normalized = []
        for u in urls:
            if isinstance(u, str) and u.startswith('/media/') and request:
                normalized.append(request.build_absolute_uri(u))
            else:
                normalized.append(u)
        ret['media_urls'] = normalized
        return ret


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


# ─── Ad Platform Integration Serializers ──────────────────────────────────────

from apis.social.models import (
    PlatformConnection,
    CampaignPlatform,
    CampaignMetricSnapshot,
    CampaignActivity,
)


class PlatformConnectionSerializer(serializers.ModelSerializer):
    """
    Tokens are EXCLUDED from output - never exposed to the frontend.
    """
    platform_display = serializers.CharField(source='get_platform_display', read_only=True)
    is_token_valid = serializers.SerializerMethodField()

    class Meta:
        model = PlatformConnection
        exclude = ['access_token_encrypted', 'refresh_token_encrypted']
        extra_kwargs = {
            'metadata': {'read_only': True},
        }

    def get_is_token_valid(self, obj):
        from django.utils import timezone
        if not obj.token_expires_at:
            return obj.status == 'connected'
        remaining = (obj.token_expires_at - timezone.now()).total_seconds()
        return remaining > 300


class CampaignPlatformSerializer(serializers.ModelSerializer):
    platform_display = serializers.CharField(source='get_platform_display', read_only=True)
    publish_status_display = serializers.CharField(source='get_publish_status_display', read_only=True)

    class Meta:
        model = CampaignPlatform
        fields = '__all__'


class CampaignMetricSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignMetricSnapshot
        fields = '__all__'


class CampaignActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignActivity
        fields = '__all__'

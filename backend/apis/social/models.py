import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class SocialClientProfile(models.Model):
    client = models.ForeignKey(
        'proposal.Client',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='social_profiles'
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    logo_url = models.CharField(max_length=500, blank=True)
    primary_color = models.CharField(max_length=30, default='#4f46e5')
    secondary_color = models.CharField(max_length=30, default='#06b6d4')
    brand_tagline = models.CharField(max_length=255, blank=True)
    target_monthly_posts = models.PositiveIntegerField(default=20)
    package_tier = models.CharField(max_length=50, default='Growth Package')
    client_email = models.EmailField(blank=True)
    client_contact = models.CharField(max_length=50, blank=True)
    approval_policy = models.CharField(
        max_length=40,
        default='client_required',
        choices=[
            ('auto_approved', 'Direct Publish'),
            ('internal_only', 'Internal Review Only'),
            ('client_required', 'Client Review Required'),
        ]
    )
    is_active = models.BooleanField(default=True, db_index=True)
    industry = models.CharField(max_length=150, blank=True, default='')
    website_url = models.CharField(max_length=300, blank=True, default='')
    contact_person = models.CharField(max_length=150, blank=True, default='')
    address = models.TextField(blank=True, default='')
    target_audience = models.TextField(blank=True, default='')
    brand_tone = models.CharField(max_length=255, blank=True, default='')
    key_usps = models.TextField(blank=True, default='')
    brand_guidelines = models.TextField(blank=True, default='')
    social_handles = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class SocialAccount(models.Model):
    PLATFORM_CHOICES = [
        ('facebook', 'Facebook Page'),
        ('instagram', 'Instagram Business'),
        ('linkedin', 'LinkedIn Page'),
        ('youtube', 'YouTube Channel'),
        ('google_business', 'Google Business Profile'),
        ('tiktok', 'TikTok'),
        ('x', 'X / Twitter'),
    ]

    STATUS_CHOICES = [
        ('connected', 'Connected'),
        ('token_expiring', 'Token Expiring Soon'),
        ('expired', 'Token Expired'),
        ('disconnected', 'Disconnected'),
        ('error', 'Connection Error'),
    ]

    client_profile = models.ForeignKey(
        SocialClientProfile,
        on_delete=models.CASCADE,
        related_name='accounts'
    )
    platform = models.CharField(max_length=40, choices=PLATFORM_CHOICES)
    account_name = models.CharField(max_length=255)
    account_id = models.CharField(max_length=255)
    username = models.CharField(max_length=255, blank=True)
    profile_picture = models.CharField(max_length=500, blank=True)
    access_token = models.TextField(blank=True)
    refresh_token = models.TextField(blank=True)
    token_expiry = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=30, default='connected', choices=STATUS_CHOICES)
    followers_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['platform', 'account_name']

    def __str__(self):
        return f'{self.account_name} ({self.get_platform_display()})'


class SocialCampaign(models.Model):
    OBJECTIVE_CHOICES = [
        ('lead_generation', 'Lead Generation'),
        ('brand_awareness', 'Brand Awareness'),
        ('traffic', 'Website Traffic'),
        ('engagement', 'Post Engagement'),
        ('conversions', 'Sales & Conversions'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('ready_to_publish', 'Ready to Publish'),
        ('publishing', 'Publishing'),
        ('published', 'Published'),
        ('pending_review', 'Pending Review'),
        ('scheduled', 'Scheduled'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
        ('publish_failed', 'Publish Failed'),
        ('sync_error', 'Sync Error'),
        ('rejected', 'Rejected'),
    ]

    CTA_CHOICES = [
        ('learn_more', 'Learn More'),
        ('sign_up', 'Sign Up'),
        ('contact_us', 'Contact Us'),
        ('shop_now', 'Shop Now'),
        ('book_now', 'Book Now'),
        ('get_quote', 'Get Quote'),
        ('download', 'Download'),
        ('apply_now', 'Apply Now'),
        ('watch_more', 'Watch More'),
        ('no_button', 'No Button'),
    ]

    client_profile = models.ForeignKey(
        SocialClientProfile,
        on_delete=models.CASCADE,
        related_name='campaigns'
    )
    name = models.CharField(max_length=255)
    objective = models.CharField(max_length=50, choices=OBJECTIVE_CHOICES, default='lead_generation')
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    spent = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    target_audience = models.TextField(blank=True)
    platforms = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, default='draft', choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Advertising platform selection ('meta', 'google')
    ad_platforms = models.JSONField(default=list, blank=True)
    campaign_type = models.CharField(max_length=50, blank=True, default='SEARCH')
    bidding_strategy = models.CharField(max_length=50, blank=True, default='MAXIMIZE_CONVERSIONS')

    # Targeting
    landing_page_url = models.CharField(max_length=1000, blank=True)
    cta = models.CharField(max_length=40, choices=CTA_CHOICES, default='learn_more', blank=True)
    target_locations = models.JSONField(default=list, blank=True)
    target_age_min = models.PositiveSmallIntegerField(null=True, blank=True)
    target_age_max = models.PositiveSmallIntegerField(null=True, blank=True)
    target_gender = models.CharField(
        max_length=10,
        choices=[('all', 'All'), ('male', 'Male'), ('female', 'Female')],
        default='all', blank=True
    )
    target_languages = models.JSONField(default=list, blank=True)

    # Creative
    ad_format = models.CharField(max_length=50, default='single_media', blank=True)
    ad_creative = models.JSONField(default=dict, blank=True)
    creative_image_url = models.CharField(max_length=1000, blank=True)
    creative_video_url = models.CharField(max_length=1000, blank=True)
    primary_text = models.TextField(blank=True)
    headline = models.CharField(max_length=255, blank=True)
    description = models.CharField(max_length=500, blank=True)

    def __str__(self):
        return f'{self.name} - {self.client_profile.name}'


class PlatformConnection(models.Model):
    """Stores a customer's authorized ad account for Meta or Google Ads.
    Tokens are stored encrypted via apis.social.encryption. Never stored in plaintext."""

    PLATFORM_CHOICES = [
        ('meta', 'Meta Ads (Facebook / Instagram)'),
        ('google', 'Google Ads'),
    ]

    STATUS_CHOICES = [
        ('connected', 'Connected'),
        ('expired', 'Token Expired'),
        ('expiring_soon', 'Token Expiring Soon'),
        ('disconnected', 'Disconnected'),
        ('error', 'Connection Error'),
        ('pending', 'Pending OAuth'),
    ]

    client_profile = models.ForeignKey(
        SocialClientProfile,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='platform_connections'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ad_platform_connections'
    )
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    account_id = models.CharField(max_length=255, blank=True)
    account_name = models.CharField(max_length=255, blank=True)

    # Encrypted. Use encryption.encrypt_token() / decrypt_token()
    access_token_encrypted = models.TextField(blank=True)
    refresh_token_encrypted = models.TextField(blank=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=20, default='pending', choices=STATUS_CHOICES)

    # Platform-specific metadata (JSON)
    # Meta: {business_id, page_id, page_name, instagram_id, instagram_username}
    # Google: {customer_id, manager_id, login_customer_id}
    metadata = models.JSONField(default=dict, blank=True)

    last_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_platform_display()} - {self.account_name or self.account_id}'


class CampaignPlatform(models.Model):
    """Per-platform record for a campaign: external IDs, publish state, sync state."""

    PLATFORM_CHOICES = [
        ('meta', 'Meta Ads'),
        ('google', 'Google Ads'),
    ]

    PUBLISH_STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('publishing', 'Publishing'),
        ('published', 'Published'),
        ('failed', 'Failed'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending_review', 'Pending Review'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
        ('removed', 'Removed'),
        ('error', 'Error'),
    ]

    campaign = models.ForeignKey(
        SocialCampaign,
        on_delete=models.CASCADE,
        related_name='campaign_platforms'
    )
    connection = models.ForeignKey(
        PlatformConnection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='campaign_platforms'
    )
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    platform_account_id = models.CharField(max_length=255, blank=True)
    platform_campaign_id = models.CharField(max_length=255, blank=True)

    publish_status = models.CharField(max_length=20, default='not_started', choices=PUBLISH_STATUS_CHOICES)
    status = models.CharField(max_length=20, default='draft', choices=STATUS_CHOICES)

    error_message = models.TextField(blank=True)
    step_failed = models.CharField(max_length=100, blank=True)
    technical_error_id = models.CharField(max_length=255, blank=True)

    last_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Meta external object IDs
    meta_campaign_id = models.CharField(max_length=255, blank=True)
    meta_ad_set_id = models.CharField(max_length=255, blank=True)
    meta_ad_creative_id = models.CharField(max_length=255, blank=True)
    meta_ad_id = models.CharField(max_length=255, blank=True)

    # Google external object IDs
    google_customer_id = models.CharField(max_length=100, blank=True)
    google_campaign_id = models.CharField(max_length=100, blank=True)
    google_ad_group_id = models.CharField(max_length=100, blank=True)
    google_ad_id = models.CharField(max_length=100, blank=True)
    google_budget_id = models.CharField(max_length=100, blank=True)

    class Meta:
        unique_together = ('campaign', 'platform')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.campaign.name} on {self.get_platform_display()} [{self.publish_status}]'


class CampaignMetricSnapshot(models.Model):
    """Daily performance snapshot per platform. Append-only - never overwrites history."""

    campaign_platform = models.ForeignKey(
        CampaignPlatform,
        on_delete=models.CASCADE,
        related_name='metric_snapshots'
    )
    date = models.DateField(db_index=True)
    spend = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    impressions = models.PositiveIntegerField(default=0)
    reach = models.PositiveIntegerField(default=0)
    clicks = models.PositiveIntegerField(default=0)
    leads = models.PositiveIntegerField(default=0)
    conversions = models.PositiveIntegerField(default=0)
    engagement = models.FloatField(default=0.0)
    ctr = models.FloatField(default=0.0)
    cpc = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    cpl = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    revenue = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    roi = models.FloatField(null=True, blank=True)
    synced_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('campaign_platform', 'date')
        ordering = ['-date']

    def __str__(self):
        return f'{self.campaign_platform} on {self.date}'


class CampaignActivity(models.Model):
    """Append-only audit log of API events and status changes."""

    campaign = models.ForeignKey(
        SocialCampaign,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    platform = models.CharField(max_length=20, blank=True)
    action = models.CharField(max_length=200)
    status = models.CharField(max_length=50, default='success')
    message = models.TextField(blank=True)
    external_id = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.campaign.name}: {self.action} [{self.status}]'


class SocialMediaAsset(models.Model):
    TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('reel', 'Reel / Short'),
        ('carousel', 'Carousel Asset'),
        ('logo', 'Brand Logo'),
        ('document', 'Document / PDF'),
    ]

    APPROVAL_CHOICES = [
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    client_profile = models.ForeignKey(
        SocialClientProfile,
        on_delete=models.CASCADE,
        related_name='media_assets'
    )
    title = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='image')
    file = models.FileField(upload_to='social_media/%Y/%m/', max_length=500, null=True, blank=True)
    file_url = models.CharField(max_length=600, blank=True)
    file_size_bytes = models.PositiveIntegerField(default=0)
    file_format = models.CharField(max_length=20, blank=True)
    folder = models.CharField(max_length=100, default='General', blank=True)
    approval_status = models.CharField(max_length=20, default='approved', choices=APPROVAL_CHOICES)
    tags = models.JSONField(default=list, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} ({self.asset_type})'


class SocialPost(models.Model):
    POST_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('carousel', 'Carousel'),
        ('reel', 'Reel / Short'),
        ('text', 'Text Post'),
    ]

    STATUS_CHOICES = [
        ('script', 'Script'),
        ('script_approval', 'Script Approval'),
        ('designing', 'Scheduled / Designing'),
        ('team_review', 'Team Review / Ready'),
        ('client_review', 'Client Review'),
        ('approved', 'Approved / Post Schedule'),
        ('published', 'Published / Posted'),
        # Backward compatibility aliases
        ('draft', 'Draft / Script'),
        ('internal_review', 'Team Review'),
        ('scheduled', 'Approved / Post Schedule'),
        ('publishing', 'Publishing'),
        ('failed', 'Failed'),
        ('rejected', 'Rejected / Revisions'),
    ]

    client_profile = models.ForeignKey(
        SocialClientProfile,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    campaign = models.ForeignKey(
        SocialCampaign,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posts'
    )
    title = models.CharField(max_length=255, blank=True)
    post_type = models.CharField(max_length=30, choices=POST_TYPE_CHOICES, default='image')
    platforms = models.JSONField(default=list)
    primary_caption = models.TextField(blank=True)
    platform_captions = models.JSONField(default=dict, blank=True)
    hashtags = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    first_comment = models.TextField(blank=True)
    media_urls = models.JSONField(default=list, blank=True)
    media_assets = models.ManyToManyField(SocialMediaAsset, blank=True, related_name='posts')
    scheduled_at = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    PRIORITY_CHOICES = [
        ('urgent', 'Urgent'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    status = models.CharField(max_length=30, default='script', choices=STATUS_CHOICES)
    priority = models.CharField(max_length=20, default='medium', choices=PRIORITY_CHOICES)
    script_notes = models.TextField(blank=True)
    designer_notes = models.TextField(blank=True)
    is_template = models.BooleanField(default=False)
    recurring_rule = models.CharField(max_length=50, blank=True)
    failure_reason = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_social_posts'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_social_posts'
    )
    checklist = models.JSONField(default=list, blank=True)
    script_data = models.JSONField(default=dict, blank=True)
    client_approval_token = models.CharField(max_length=64, blank=True, db_index=True)
    client_feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_at', '-created_at']

    def save(self, *args, **kwargs):
        if not self.client_approval_token:
            self.client_approval_token = uuid.uuid4().hex
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.title or self.primary_caption[:40]} [{self.status}]'


class PostApprovalHistory(models.Model):
    post = models.ForeignKey(
        SocialPost,
        on_delete=models.CASCADE,
        related_name='approval_history'
    )
    action = models.CharField(max_length=50)
    actor_name = models.CharField(max_length=150)
    actor_role = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']


class SocialInboxMessage(models.Model):
    PLATFORM_CHOICES = [
        ('instagram', 'Instagram'),
        ('facebook', 'Facebook'),
        ('linkedin', 'LinkedIn'),
        ('whatsapp', 'WhatsApp'),
        ('x', 'X / Twitter'),
        ('youtube', 'YouTube'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Reply'),
        ('resolved', 'Resolved'),
        ('important', 'Important'),
    ]

    client_profile = models.ForeignKey(
        SocialClientProfile,
        on_delete=models.CASCADE,
        related_name='inbox_messages'
    )
    account = models.ForeignKey(
        SocialAccount,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='messages'
    )
    platform = models.CharField(max_length=40, choices=PLATFORM_CHOICES)
    message_type = models.CharField(
        max_length=20,
        choices=[
            ('comment', 'Comment'),
            ('dm', 'Direct Message'),
            ('mention', 'Mention'),
            ('lead_ad', 'Lead Ad Form'),
        ],
        default='comment'
    )
    sender_name = models.CharField(max_length=255)
    sender_handle = models.CharField(max_length=255, blank=True)
    sender_phone = models.CharField(max_length=40, blank=True)
    sender_avatar = models.CharField(max_length=500, blank=True)
    post_context = models.CharField(max_length=255, blank=True)
    message_text = models.TextField()
    status = models.CharField(max_length=20, default='pending', choices=STATUS_CHOICES)
    is_lead = models.BooleanField(default=False)
    converted_lead = models.ForeignKey(
        'leads.Lead',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='social_inbox_sources'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_inbox_messages'
    )
    replies = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.sender_name} via {self.platform} ({self.status})'


class SocialDailyAnalytics(models.Model):
    client_profile = models.ForeignKey(
        SocialClientProfile,
        on_delete=models.CASCADE,
        related_name='daily_analytics'
    )
    account = models.ForeignKey(
        SocialAccount,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='analytics'
    )
    date = models.DateField(db_index=True)
    platform = models.CharField(max_length=40)
    followers = models.PositiveIntegerField(default=0)
    follower_change = models.IntegerField(default=0)
    reach = models.PositiveIntegerField(default=0)
    impressions = models.PositiveIntegerField(default=0)
    engagement_rate = models.FloatField(default=0.0)
    likes = models.PositiveIntegerField(default=0)
    comments = models.PositiveIntegerField(default=0)
    shares = models.PositiveIntegerField(default=0)
    saves = models.PositiveIntegerField(default=0)
    posts_published = models.PositiveIntegerField(default=0)
    leads_generated = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('client_profile', 'date', 'platform')
        ordering = ['-date']

    def __str__(self):
        return f'{self.client_profile.name} - {self.platform} on {self.date}'

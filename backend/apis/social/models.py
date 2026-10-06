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
    # Monthly content planning: what happens to undelivered items when a month is closed
    carry_over_policy = models.CharField(
        max_length=20,
        default='adjust_billing',
        choices=[
            ('carry_over', 'Carry over to next month'),
            ('adjust_billing', 'Reduce the bill (no carry-over)'),
        ]
    )
    default_package = models.ForeignKey(
        'ContentPackage',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='default_for_clients'
    )
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

    # Google Ads specific fields
    google_campaign_type = models.CharField(max_length=30, blank=True, default='')
    google_objective = models.CharField(max_length=50, blank=True, default='')
    google_bidding_strategy = models.CharField(max_length=50, blank=True, default='MAXIMIZE_CONVERSIONS')
    google_bidding_config = models.JSONField(default=dict, blank=True)
    google_campaign_settings = models.JSONField(default=dict, blank=True)
    google_keywords = models.JSONField(default=list, blank=True)
    google_ad_groups = models.JSONField(default=list, blank=True)
    google_ads_data = models.JSONField(default=list, blank=True)
    google_asset_groups = models.JSONField(default=list, blank=True)
    google_assets = models.JSONField(default=dict, blank=True)
    google_daily_budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    google_phone_number = models.CharField(max_length=30, blank=True, default='')
    google_final_url = models.CharField(max_length=1000, blank=True, default='')
    google_draft_step = models.CharField(max_length=50, blank=True, default='objective')

    def __str__(self):
        return f'{self.name} - {self.client_profile.name}'


class PlatformConnection(models.Model):
    """Stores a customer's authorized ad account for Meta or Google Ads.
    Tokens are stored encrypted via apis.social.encryption. Never stored in plaintext."""

    PLATFORM_CHOICES = [
        ('meta', 'Meta Ads (Facebook / Instagram)'),
        ('google', 'Google Ads'),
        ('linkedin', 'LinkedIn Ads'),
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
        ('linkedin', 'LinkedIn Ads'),
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
        ('archived', 'Archived'),
        ('content_rejected', 'Rejected / Dropped'),
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
    live_urls = models.JSONField(default=dict, blank=True)
    analytics = models.JSONField(default=dict, blank=True)
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
    # Per-role owners shown as avatars on the workflow board
    writer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='written_social_posts'
    )
    designer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='designed_social_posts'
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_social_posts'
    )
    checklist = models.JSONField(default=list, blank=True)
    script_data = models.JSONField(default=dict, blank=True)
    client_approval_token = models.CharField(max_length=64, blank=True, db_index=True)
    client_feedback = models.TextField(blank=True)
    # Revision loop tracking (incremented every time content is sent back for rework)
    revision_count = models.PositiveIntegerField(default=0)
    client_revision_count = models.PositiveIntegerField(default=0)
    last_revision_categories = models.JSONField(default=list, blank=True)
    # Full rejection (content dropped entirely or restarted from scratch)
    rejection_reason = models.TextField(blank=True)
    rejection_categories = models.JSONField(default=list, blank=True)
    rejected_by = models.CharField(max_length=20, blank=True)  # 'client' | 'internal'
    rejected_from_stage = models.CharField(max_length=30, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
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
    EVENT_TYPE_CHOICES = [
        ('transition', 'Transition'),
        ('revision', 'Revision Requested'),
        ('rejection', 'Content Rejected'),
        ('approval', 'Approval'),
        ('note', 'Note'),
    ]

    action = models.CharField(max_length=50)
    actor_name = models.CharField(max_length=150)
    actor_role = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, default='transition', choices=EVENT_TYPE_CHOICES)
    from_stage = models.CharField(max_length=30, blank=True)
    to_stage = models.CharField(max_length=30, blank=True)
    reason_categories = models.JSONField(default=list, blank=True)
    severity = models.CharField(max_length=20, blank=True)  # 'minor' | 'major'
    revision_round = models.PositiveIntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']


class MistakeFix(models.Model):
    """A corrective action applied against a recurring rejection/revision reason.

    Stores the baseline at apply-time so the insights engine can later measure
    whether the mistake rate for that category actually dropped.
    """
    client_profile = models.ForeignKey(
        SocialClientProfile,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='mistake_fixes'
    )  # null = applies to all clients
    category = models.CharField(max_length=60)
    title = models.CharField(max_length=200)
    checklist_items = models.JSONField(default=list, blank=True)
    lesson = models.TextField(blank=True)
    baseline_count_30d = models.PositiveIntegerField(default=0)
    applied_by = models.CharField(max_length=150, blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-applied_at']

    def __str__(self):
        return f'{self.category}: {self.title}'


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


class PostComment(models.Model):
    """Team discussion on a post, separate from the workflow timeline."""

    post = models.ForeignKey(SocialPost, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='social_post_comments'
    )
    author_name = models.CharField(max_length=150)
    author_role = models.CharField(max_length=50, blank=True)
    body = models.TextField()
    mentions = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='PostCommentMention',
        related_name='social_comment_mentions',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at', 'id']

    def __str__(self):
        return f'{self.author_name} on post {self.post_id}: {self.body[:40]}'


class PostCommentMention(models.Model):
    """An @mention of a team member in a comment; doubles as their unread notification."""

    comment = models.ForeignKey(PostComment, on_delete=models.CASCADE, related_name='mention_links')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='social_mentions')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-id']
        unique_together = ('comment', 'user')


# ─── Monthly content planning (the "Plan" stage before Script) ───

CONTENT_TYPE_CHOICES = SocialPost.POST_TYPE_CHOICES

CONTENT_PILLAR_CHOICES = [
    ('educational', 'Educational'),
    ('promotional', 'Promotional'),
    ('engagement', 'Engagement'),
    ('behind_the_scenes', 'Behind the Scenes'),
    ('testimonial', 'Testimonial'),
    ('festive', 'Festive / Event'),
    ('other', 'Other'),
]

PRODUCTION_METHOD_CHOICES = [
    ('in_house', 'In-house Design'),
    ('ai_generated', 'AI Generated'),
    ('shoot', 'Shoot'),
    ('outsourced', 'Outsourced Team'),
]


class ContentPackage(models.Model):
    """Reusable monthly deliverables template (e.g. 'Growth: 4 reels + 10 images')."""

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    # [{"post_type": "reel", "quantity": 4, "unit_price": "1500.00", "platforms": ["instagram"]}]
    quotas = models.JSONField(default=list, blank=True)
    pillar_mix = models.JSONField(default=dict, blank=True)  # {"educational": 40, ...}
    monthly_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ContentPlan(models.Model):
    """One client's content plan for one month: quotas, brief, slots and client sign-off."""

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent to Client'),
        ('changes_requested', 'Client Requested Changes'),
        ('approved', 'Approved'),
        ('closed', 'Month Closed'),
    ]
    POLICY_CHOICES = [
        ('inherit', 'Client Default'),
        ('carry_over', 'Carry over to next month'),
        ('adjust_billing', 'Reduce the bill (no carry-over)'),
    ]

    client_profile = models.ForeignKey(SocialClientProfile, on_delete=models.CASCADE, related_name='content_plans')
    month = models.DateField(help_text='First day of the planned month')
    status = models.CharField(max_length=20, default='draft', choices=STATUS_CHOICES)
    package = models.ForeignKey(ContentPackage, null=True, blank=True, on_delete=models.SET_NULL, related_name='plans')
    carry_over_policy = models.CharField(max_length=20, default='inherit', choices=POLICY_CHOICES)
    monthly_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Monthly brief
    brief_goals = models.TextField(blank=True)
    brief_offers = models.TextField(blank=True)
    brief_focus = models.TextField(blank=True)
    brief_avoid = models.TextField(blank=True)
    brief_references = models.JSONField(default=list, blank=True)  # list of URLs
    brief_notes = models.TextField(blank=True)

    # Scheduling rules
    pillar_mix = models.JSONField(default=dict, blank=True)
    posting_days = models.JSONField(default=dict, blank=True)  # {"reel": [1, 4]} (0 = Monday)
    posting_time = models.TimeField(default='19:00')
    lead_days = models.JSONField(default=dict, blank=True)  # days before publish each stage must be done

    # Client sign-off
    client_approval_token = models.CharField(max_length=64, blank=True, db_index=True)
    client_feedback = models.TextField(blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by_name = models.CharField(max_length=150, blank=True)

    # Month close result (delivery, carry-over and billing adjustment)
    closed_at = models.DateTimeField(null=True, blank=True)
    close_summary = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-month', 'client_profile__name']
        unique_together = ('client_profile', 'month')

    def save(self, *args, **kwargs):
        if not self.client_approval_token:
            self.client_approval_token = uuid.uuid4().hex
        super().save(*args, **kwargs)

    @property
    def effective_policy(self):
        if self.carry_over_policy != 'inherit':
            return self.carry_over_policy
        return self.client_profile.carry_over_policy or 'adjust_billing'

    def __str__(self):
        return f'{self.client_profile.name} {self.month:%b %Y} [{self.status}]'


class ContentPlanQuota(models.Model):
    """How many of one content type the client gets this month."""

    plan = models.ForeignKey(ContentPlan, on_delete=models.CASCADE, related_name='quotas')
    post_type = models.CharField(max_length=30, choices=CONTENT_TYPE_CHOICES)
    quantity = models.PositiveIntegerField(default=0)
    carried_in = models.PositiveIntegerField(default=0)  # added from last month's shortfall
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    platforms = models.JSONField(default=list, blank=True)
    notes = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['id']
        unique_together = ('plan', 'post_type')

    @property
    def target(self):
        return self.quantity + self.carried_in


class KeyDate(models.Model):
    """Festivals, national days and client events shown on the planning calendar."""

    CATEGORY_CHOICES = [
        ('festival', 'Festival'),
        ('national', 'National Day'),
        ('awareness', 'Awareness Day'),
        ('client_event', 'Client Event'),
        ('offer', 'Offer / Sale'),
        ('launch', 'Launch'),
        ('other', 'Other'),
    ]

    client_profile = models.ForeignKey(
        SocialClientProfile, null=True, blank=True, on_delete=models.CASCADE, related_name='key_dates'
    )  # null = applies to every client
    date = models.DateField()
    title = models.CharField(max_length=150)
    category = models.CharField(max_length=20, default='festival', choices=CATEGORY_CHOICES)
    recurring_yearly = models.BooleanField(default=False)
    office_closed = models.BooleanField(default=False)  # holiday: deadlines skip this day
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'title']

    def __str__(self):
        return f'{self.title} ({self.date})'


class ProductionVendor(models.Model):
    """External teams we outsource to (anchoring, shoots, voice-over...)."""

    VENDOR_TYPE_CHOICES = [
        ('anchoring', 'Anchoring'),
        ('video_production', 'Video Production'),
        ('photography', 'Photography'),
        ('voice_over', 'Voice Over'),
        ('editing', 'Editing'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=150)
    vendor_type = models.CharField(max_length=30, default='anchoring', choices=VENDOR_TYPE_CHOICES)
    contact_person = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    rate_note = models.CharField(max_length=255, blank=True)
    turnaround_days = models.PositiveIntegerField(default=0)  # working days they need; 0 = use defaults
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ShootSchedule(models.Model):
    """A shoot day that batches several video slots together."""

    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('confirmed', 'Confirmed'),
        ('done', 'Done'),
        ('cancelled', 'Cancelled'),
    ]

    client_profile = models.ForeignKey(SocialClientProfile, on_delete=models.CASCADE, related_name='shoots')
    plan = models.ForeignKey(ContentPlan, null=True, blank=True, on_delete=models.SET_NULL, related_name='shoots')
    title = models.CharField(max_length=150, blank=True)
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    crew = models.TextField(blank=True)  # people / talent
    props = models.TextField(blank=True)
    vendor = models.ForeignKey(ProductionVendor, null=True, blank=True, on_delete=models.SET_NULL, related_name='shoots')
    status = models.CharField(max_length=20, default='planned', choices=STATUS_CHOICES)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f'{self.client_profile.name} shoot on {self.date}'


class ContentPlanItem(models.Model):
    """A planned slot. 'Start script' turns it into a SocialPost in the Script stage."""

    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('started', 'In Production'),
        ('dropped', 'Dropped'),
    ]

    plan = models.ForeignKey(ContentPlan, on_delete=models.CASCADE, related_name='items')
    post_type = models.CharField(max_length=30, choices=CONTENT_TYPE_CHOICES, default='image')
    title = models.CharField(max_length=255, blank=True)
    idea = models.TextField(blank=True)
    pillar = models.CharField(max_length=30, choices=CONTENT_PILLAR_CHOICES, blank=True)
    platforms = models.JSONField(default=list, blank=True)
    planned_date = models.DateField(null=True, blank=True)
    planned_time = models.TimeField(null=True, blank=True)
    production_method = models.CharField(max_length=20, choices=PRODUCTION_METHOD_CHOICES, default='in_house')
    vendor = models.ForeignKey(ProductionVendor, null=True, blank=True, on_delete=models.SET_NULL, related_name='plan_items')
    shoot = models.ForeignKey(ShootSchedule, null=True, blank=True, on_delete=models.SET_NULL, related_name='items')
    key_date = models.ForeignKey(KeyDate, null=True, blank=True, on_delete=models.SET_NULL, related_name='plan_items')
    writer = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='planned_writing')
    designer = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='planned_design')
    post = models.OneToOneField(SocialPost, null=True, blank=True, on_delete=models.SET_NULL, related_name='plan_item')
    status = models.CharField(max_length=20, default='planned', choices=STATUS_CHOICES)
    is_carry_over = models.BooleanField(default=False)
    carried_from = models.ForeignKey(ContentPlan, null=True, blank=True, on_delete=models.SET_NULL, related_name='carried_out_items')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['planned_date', 'planned_time', 'id']

    def __str__(self):
        return f'{self.title or self.get_post_type_display()} on {self.planned_date}'


class ContentIdea(models.Model):
    """Idea bank: anyone can drop an idea; it gets pulled into a plan slot later."""

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('used', 'Used'),
        ('archived', 'Archived'),
    ]

    client_profile = models.ForeignKey(
        SocialClientProfile, null=True, blank=True, on_delete=models.CASCADE, related_name='content_ideas'
    )  # null = general idea usable for any client
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    post_type = models.CharField(max_length=30, choices=CONTENT_TYPE_CHOICES, blank=True)
    pillar = models.CharField(max_length=30, choices=CONTENT_PILLAR_CHOICES, blank=True)
    reference_url = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=20, default='open', choices=STATUS_CHOICES)
    used_in = models.ForeignKey(ContentPlanItem, null=True, blank=True, on_delete=models.SET_NULL, related_name='ideas')
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    submitted_by_name = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

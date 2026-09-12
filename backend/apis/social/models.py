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
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
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
    status = models.CharField(max_length=20, default='active', choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.name} - {self.client_profile.name}'


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
    file = models.FileField(upload_to='social_media/%Y/%m/', null=True, blank=True)
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
        ('draft', 'Draft'),
        ('internal_review', 'Internal Review'),
        ('client_review', 'Client Review'),
        ('approved', 'Approved'),
        ('scheduled', 'Scheduled'),
        ('publishing', 'Publishing'),
        ('published', 'Published'),
        ('failed', 'Failed'),
        ('rejected', 'Rejected'),
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
    status = models.CharField(max_length=30, default='draft', choices=STATUS_CHOICES)
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

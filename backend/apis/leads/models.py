import base64
import hashlib
import uuid
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models.functions import Lower
from django.utils import timezone
from cryptography.fernet import Fernet, InvalidToken

from .choices import (
    ACTIVITY_TYPE_CHOICES,
    APPROVAL_STATUS_CHOICES,
    CALL_DIRECTION_CHOICES,
    CALL_OUTCOME_CHOICES,
    CONTACT_NUMBER_LABEL_CHOICES,
    CONTACT_NUMBER_TYPE_CHOICES,
    CONVERSION_TYPE_CHOICES,
    DEMO_OUTCOME_CHOICES,
    DOCUMENT_TYPE_CHOICES,
    FEASIBILITY_STATUS_CHOICES,
    FOLLOW_UP_STATUS_CHOICES,
    FOLLOW_UP_TYPE_CHOICES,
    INTEREST_LEVEL_CHOICES,
    LEAD_STAGE_CHOICES,
    LEAD_TEMPERATURE_CHOICES,
    LEAD_TYPE_CHOICES,
    MEETING_MODE_CHOICES,
    MEETING_STATUS_CHOICES,
    MEETING_TYPE_CHOICES,
    PRIORITY_CHOICES,
    REJECTION_REASON_CHOICES,
    REQUIREMENT_STATUS_CHOICES,
    TARGET_LIST_STATUS_CHOICES,
    TASK_STATUS_CHOICES,
    TASK_TYPE_CHOICES,
)
from .validators import normalize_phone, sanitize_filename, validate_document_file, validate_phone


def lead_document_upload_to(instance, filename):
    """Store documents under a non-guessable name while retaining a safe suffix."""
    safe_name = sanitize_filename(filename)
    suffix = Path(safe_name).suffix.lower()
    lead_id = instance.lead_id or "unassigned"
    return f"lead_documents/{lead_id}/{uuid.uuid4().hex}{suffix}"


def generate_lead_number():
    return f"LD-{timezone.now():%Y}-{uuid.uuid4().hex[:10].upper()}"


class TargetCustomerList(models.Model):
    name = models.CharField(max_length=255)
    scope_date = models.DateField(null=True, blank=True, db_index=True)
    description = models.TextField(blank=True)
    campaign = models.CharField(max_length=255, blank=True, db_index=True)
    source = models.CharField(max_length=120, blank=True, db_index=True)
    assigned_team = models.CharField(max_length=120, blank=True, help_text="Existing user department/team label")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_target_customer_lists",
    )
    status = models.CharField(max_length=30, choices=TARGET_LIST_STATUS_CHOICES, default="ACTIVE", db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]
        indexes = [models.Index(fields=["campaign", "status"], name="leadlist_campaign_status")]

    def __str__(self):
        return self.name


class TargetCustomer(models.Model):
    customer_list = models.ForeignKey(
        TargetCustomerList,
        on_delete=models.CASCADE,
        related_name="customers",
    )
    customer_name = models.CharField(max_length=255, blank=True)
    company_name = models.CharField(max_length=300, blank=True)
    contact_person = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=32, blank=True, validators=[validate_phone], db_index=True)
    whatsapp_number = models.CharField(max_length=32, blank=True, validators=[validate_phone])
    email = models.EmailField(blank=True, db_index=True)
    website = models.URLField(blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=120, blank=True)
    state = models.CharField(max_length=120, blank=True)
    industry = models.CharField(max_length=160, blank=True)
    business_category = models.CharField(max_length=160, blank=True)
    customer_type = models.CharField(max_length=80, blank=True)
    interested_product = models.CharField(max_length=255, blank=True, db_index=True)
    interested_service = models.CharField(max_length=255, blank=True, db_index=True)
    source = models.CharField(max_length=120, blank=True, db_index=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="MEDIUM", db_index=True)
    tags = models.JSONField(default=list, blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_target_customers",
    )
    notes = models.TextField(blank=True)
    do_not_call = models.BooleanField(default=False, db_index=True)
    imported_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]
        indexes = [
            models.Index(fields=["customer_list", "assigned_to"], name="target_list_assignee"),
            models.Index(fields=["source", "priority"], name="target_source_priority"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["phone"],
                condition=~models.Q(phone=""),
                name="target_unique_nonblank_phone",
            ),
            models.UniqueConstraint(
                fields=["whatsapp_number"],
                condition=~models.Q(whatsapp_number=""),
                name="target_unique_nonblank_whatsapp",
            ),
            models.UniqueConstraint(
                Lower("email"),
                condition=~models.Q(email=""),
                name="target_unique_nonblank_email_ci",
            ),
        ]

    def _normalize_contact_fields(self):
        self.email = (self.email or "").strip().lower()
        if self.phone:
            self.phone = normalize_phone(self.phone)
        if self.whatsapp_number:
            self.whatsapp_number = normalize_phone(self.whatsapp_number)

    def clean_fields(self, exclude=None):
        self._normalize_contact_fields()
        return super().clean_fields(exclude=exclude)

    def clean(self):
        if not any([self.customer_name, self.company_name, self.contact_person]):
            raise ValidationError("At least one customer, company, or contact name is required.")

    def save(self, *args, **kwargs):
        self._normalize_contact_fields()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.company_name or self.customer_name or self.contact_person


class Lead(models.Model):
    lead_number = models.CharField(
        max_length=40,
        unique=True,
        editable=False,
        db_index=True,
        default=generate_lead_number,
    )
    target_customer = models.ForeignKey(
        TargetCustomer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="leads",
    )
    customer = models.ForeignKey(
        "proposal.Client",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="leads",
    )
    quotation = models.ForeignKey(
        "proposal.Proposal",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="source_leads",
        help_text="Existing Proposal record used as the commercial proposal/quotation.",
    )
    lead_type = models.CharField(max_length=20, choices=LEAD_TYPE_CHOICES, default="SERVICE", db_index=True)
    customer_name = models.CharField(max_length=255, blank=True)
    company_name = models.CharField(max_length=300, blank=True)
    contact_person = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=32, blank=True, validators=[validate_phone], db_index=True)
    whatsapp_number = models.CharField(max_length=32, blank=True, validators=[validate_phone])
    email = models.EmailField(blank=True, db_index=True)
    address = models.TextField(blank=True)
    source = models.CharField(max_length=120, blank=True, db_index=True)
    campaign = models.CharField(max_length=255, blank=True, db_index=True)
    product = models.CharField(max_length=255, blank=True, db_index=True)
    service = models.CharField(max_length=255, blank=True, db_index=True)
    requirement_summary = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_leads",
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lead_assignments_made",
    )
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="MEDIUM", db_index=True)
    temperature = models.CharField(
        max_length=20,
        choices=LEAD_TEMPERATURE_CHOICES,
        default="COLD",
        db_index=True,
    )
    lead_score = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    estimated_value = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    conversion_probability = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    current_stage = models.CharField(max_length=50, choices=LEAD_STAGE_CHOICES, default="NEW", db_index=True)
    stage_before_hold = models.CharField(max_length=50, choices=LEAD_STAGE_CHOICES, blank=True)
    next_follow_up_at = models.DateTimeField(null=True, blank=True, db_index=True)
    last_activity_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_leads",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]
        indexes = [
            models.Index(fields=["current_stage", "assigned_to"], name="lead_stage_assignee"),
            models.Index(fields=["next_follow_up_at", "current_stage"], name="lead_followup_stage"),
            models.Index(fields=["source", "campaign"], name="lead_source_campaign"),
            models.Index(fields=["lead_type", "product", "service"], name="lead_type_offering"),
            models.Index(fields=["created_at", "current_stage"], name="lead_created_stage"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["phone"],
                condition=~models.Q(phone=""),
                name="lead_unique_nonblank_phone",
            ),
            models.UniqueConstraint(
                fields=["whatsapp_number"],
                condition=~models.Q(whatsapp_number=""),
                name="lead_unique_nonblank_whatsapp",
            ),
            models.UniqueConstraint(
                Lower("email"),
                condition=~models.Q(email=""),
                name="lead_unique_nonblank_email_ci",
            ),
            models.CheckConstraint(
                condition=models.Q(lead_score__gte=0, lead_score__lte=100),
                name="lead_score_between_0_100",
            ),
            models.CheckConstraint(
                condition=models.Q(conversion_probability__gte=0, conversion_probability__lte=100),
                name="lead_probability_0_100",
            ),
            models.CheckConstraint(
                condition=models.Q(estimated_value__isnull=True) | models.Q(estimated_value__gte=0),
                name="lead_estimated_value_nonnegative",
            ),
        ]

    @classmethod
    def generate_lead_number(cls):
        return generate_lead_number()

    def _normalize_contact_fields(self):
        self.email = (self.email or "").strip().lower()
        if self.phone:
            self.phone = normalize_phone(self.phone)
        if self.whatsapp_number:
            self.whatsapp_number = normalize_phone(self.whatsapp_number)

    def clean_fields(self, exclude=None):
        self._normalize_contact_fields()
        return super().clean_fields(exclude=exclude)

    def clean(self):
        if not self.target_customer_id and not getattr(self, "_skip_offering_validation", False):
            if self.lead_type == "PRODUCT" and not self.product:
                raise ValidationError({"product": "Product is required for a product lead."})
            if self.lead_type == "SERVICE" and not self.service:
                raise ValidationError({"service": "Service is required for a service lead."})
        if not any([self.customer_name, self.company_name, self.contact_person]):
            raise ValidationError("At least one customer, company, or contact name is required.")

    def save(self, *args, **kwargs):
        if not self.lead_number:
            self.lead_number = self.generate_lead_number()
        self._normalize_contact_fields()
        if not self.pk and self.current_stage not in {"TARGETED", "NEW"} and not getattr(self, "_workflow_initial_stage", False):
            raise ValidationError("New leads can only start in TARGETED or NEW.")
        if self.pk and not getattr(self, "_workflow_stage_update", False):
            previous = type(self).objects.filter(pk=self.pk).values_list("current_stage", flat=True).first()
            if previous is not None and previous != self.current_stage:
                raise ValidationError("Lead stage changes must go through LeadWorkflowService.")
        return super().save(*args, **kwargs)

    def _save_workflow_stage(self, stage, *, previous_stage=""):
        self.current_stage = stage
        self.stage_before_hold = previous_stage
        self.last_activity_at = timezone.now()
        self._workflow_stage_update = True
        try:
            self.save(update_fields=["current_stage", "stage_before_hold", "last_activity_at", "updated_at"])
        finally:
            self._workflow_stage_update = False

    @property
    def do_not_call(self):
        return bool(self.target_customer_id and self.target_customer and self.target_customer.do_not_call)

    def __str__(self):
        return f"{self.lead_number} - {self.company_name or self.customer_name or self.contact_person}"


class ContactNumber(models.Model):
    target_customer = models.ForeignKey(
        TargetCustomer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contact_numbers",
    )
    lead = models.ForeignKey(
        "Lead",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contact_numbers",
    )
    number_type = models.CharField(max_length=20, choices=CONTACT_NUMBER_TYPE_CHOICES, default="PHONE")
    label = models.CharField(max_length=20, choices=CONTACT_NUMBER_LABEL_CHOICES, default="COMPANY")
    number = models.CharField(max_length=32, validators=[validate_phone])
    contact_name = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_primary", "id"]

    def clean(self):
        if not self.target_customer_id and not self.lead_id:
            raise ValidationError("Contact number must be linked to either a target customer or a lead.")

    def save(self, *args, **kwargs):
        self.number = normalize_phone(self.number)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_number_type_display()} ({self.get_label_display()}): {self.number}"


class LeadAssignmentHistory(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="assignment_history")
    assigned_from = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lead_assignments_from",
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="lead_assignments_to",
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="lead_assignment_history_actions",
    )
    reason = models.TextField(blank=True)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-assigned_at", "-id"]


class LeadCall(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="calls")
    caller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="lead_calls",
    )
    direction = models.CharField(max_length=20, choices=CALL_DIRECTION_CHOICES, default="OUTBOUND")
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    outcome = models.CharField(max_length=40, choices=CALL_OUTCOME_CHOICES)
    customer_response = models.TextField(blank=True)
    discussion_summary = models.TextField(blank=True)
    next_action = models.TextField(blank=True)
    follow_up_required = models.BooleanField(default=False)
    follow_up_at = models.DateTimeField(null=True, blank=True)
    meeting_required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-started_at", "-id"]
        indexes = [models.Index(fields=["lead", "started_at"], name="lead_call_started")]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(ended_at__isnull=True) | models.Q(ended_at__gte=models.F("started_at")),
                name="lead_call_end_after_start",
            )
        ]

    def clean(self):
        if self.ended_at and self.ended_at < self.started_at:
            raise ValidationError({"ended_at": "Call end must be after call start."})
        if self.follow_up_required and not self.follow_up_at:
            raise ValidationError({"follow_up_at": "A follow-up time is required."})
        if self.follow_up_at and self.follow_up_at <= timezone.now():
            raise ValidationError({"follow_up_at": "Call follow-up must be in the future."})
        if self.direction == "OUTBOUND" and self.lead_id and self.lead.do_not_call:
            raise ValidationError("Outbound calls are blocked for do-not-call contacts.")

    def save(self, *args, **kwargs):
        if self.started_at and self.ended_at:
            self.duration_seconds = max(0, int((self.ended_at - self.started_at).total_seconds()))
        return super().save(*args, **kwargs)


class LeadFollowUp(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="follow_ups")
    follow_up_type = models.CharField(max_length=40, choices=FOLLOW_UP_TYPE_CHOICES)
    scheduled_at = models.DateTimeField(db_index=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="lead_follow_ups",
    )
    purpose = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=FOLLOW_UP_STATUS_CHOICES, default="SCHEDULED", db_index=True)
    result = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    next_follow_up_at = models.DateTimeField(null=True, blank=True)
    reminder_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_lead_follow_ups",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["scheduled_at", "id"]
        indexes = [models.Index(fields=["status", "scheduled_at"], name="followup_status_due")]

    def clean(self):
        if self.status == "SCHEDULED" and self.scheduled_at <= timezone.now():
            raise ValidationError({"scheduled_at": "Scheduled follow-ups must be in the future."})
        if self.next_follow_up_at and self.next_follow_up_at <= timezone.now():
            raise ValidationError({"next_follow_up_at": "Next follow-up must be in the future."})
        if self.follow_up_type == "PHONE" and self.lead_id and self.lead.do_not_call:
            raise ValidationError("Phone follow-ups are blocked for do-not-call contacts.")


class LeadMeeting(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="meetings")
    title = models.CharField(max_length=255)
    meeting_type = models.CharField(max_length=50, choices=MEETING_TYPE_CHOICES, db_index=True)
    meeting_mode = models.CharField(max_length=30, choices=MEETING_MODE_CHOICES)
    scheduled_start = models.DateTimeField(db_index=True)
    scheduled_end = models.DateTimeField()
    location = models.CharField(max_length=500, blank=True)
    map_link = models.URLField(blank=True)
    meeting_link = models.URLField(blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="lead_meetings",
    )
    attendees = models.JSONField(default=list, blank=True)
    agenda = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=MEETING_STATUS_CHOICES, default="SCHEDULED", db_index=True)
    outcome = models.TextField(blank=True)
    reminder_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_lead_meetings",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["scheduled_start", "id"]
        indexes = [models.Index(fields=["status", "scheduled_start"], name="meeting_status_start")]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(scheduled_end__gt=models.F("scheduled_start")),
                name="lead_meeting_end_after_start",
            )
        ]

    def clean(self):
        if self.scheduled_end <= self.scheduled_start:
            raise ValidationError({"scheduled_end": "Meeting end must be after its start."})
        if self.status in {"SCHEDULED", "CONFIRMED", "RESCHEDULED"} and self.scheduled_start <= timezone.now():
            raise ValidationError({"scheduled_start": "Active meetings must be scheduled in the future."})
        if self.meeting_type == "PRODUCT_DEMO" and self.lead_id and self.lead.lead_type != "PRODUCT":
            raise ValidationError("Product demos are only valid for product leads.")
        if self.meeting_type == "SERVICE_REQUIREMENT" and self.lead_id and self.lead.lead_type != "SERVICE":
            raise ValidationError("Service requirement meetings are only valid for service leads.")
        if self.meeting_type == "CUSTOMIZATION_REQUIREMENT" and self.lead_id:
            if not self.lead.demos.filter(customization_required=True, completed_at__isnull=False).exists():
                raise ValidationError("A completed customization-required demo is required for this meeting.")


class ProductDemo(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="demos")
    meeting = models.OneToOneField(
        LeadMeeting,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="product_demo",
    )
    product = models.CharField(max_length=255)
    product_version = models.CharField(max_length=120, blank=True)
    presented_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="presented_product_demos",
    )
    customer_attendees = models.JSONField(default=list, blank=True)
    requested_features = models.TextField(blank=True)
    customer_pain_points = models.TextField(blank=True)
    feedback = models.TextField(blank=True)
    interest_level = models.CharField(max_length=30, choices=INTEREST_LEVEL_CHOICES, blank=True)
    trial_requested = models.BooleanField(default=False)
    trial_start = models.DateField(null=True, blank=True)
    trial_end = models.DateField(null=True, blank=True)
    customization_required = models.BooleanField(default=False)
    quotation_required = models.BooleanField(default=False)
    outcome = models.CharField(max_length=50, choices=DEMO_OUTCOME_CHOICES, blank=True)
    next_action = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-completed_at", "-id"]
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(trial_start__isnull=True)
                    | models.Q(trial_end__isnull=True)
                    | models.Q(trial_end__gte=models.F("trial_start"))
                ),
                name="lead_demo_trial_dates_valid",
            )
        ]

    def clean(self):
        if self.lead_id and self.lead.lead_type != "PRODUCT":
            raise ValidationError("Product demos are only valid for product leads.")
        if self.meeting_id:
            if self.meeting.lead_id != self.lead_id:
                raise ValidationError({"meeting": "Demo meeting must belong to the same lead."})
            if self.meeting.meeting_type != "PRODUCT_DEMO":
                raise ValidationError({"meeting": "Demo must reference a PRODUCT_DEMO meeting."})
        if self.trial_start and self.trial_end and self.trial_end < self.trial_start:
            raise ValidationError({"trial_end": "Trial end cannot precede trial start."})


class ServiceRequirement(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="service_requirements")
    meeting = models.ForeignKey(
        LeadMeeting,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="service_requirements",
    )
    service = models.CharField(max_length=255, blank=True)
    business_objective = models.TextField()
    current_problem = models.TextField()
    required_solution = models.TextField()
    target_users = models.TextField(blank=True)
    required_features = models.TextField(blank=True)
    integration_requirements = models.TextField(blank=True)
    technology_preference = models.CharField(max_length=255, blank=True)
    estimated_budget = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    expected_start_date = models.DateField(null=True, blank=True)
    expected_completion_date = models.DateField(null=True, blank=True)
    decision_maker = models.CharField(max_length=255, blank=True)
    proposal_deadline = models.DateTimeField(null=True, blank=True, db_index=True)
    site_visit_required = models.BooleanField(default=False)
    technical_review_required = models.BooleanField(default=False)
    feasibility_status = models.CharField(
        max_length=30,
        choices=FEASIBILITY_STATUS_CHOICES,
        default="PENDING",
        db_index=True,
    )
    requirement_status = models.CharField(
        max_length=30,
        choices=REQUIREMENT_STATUS_CHOICES,
        default="DRAFT",
        db_index=True,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_service_requirements",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(estimated_budget__isnull=True) | models.Q(estimated_budget__gte=0),
                name="lead_requirement_budget_nonnegative",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(expected_start_date__isnull=True)
                    | models.Q(expected_completion_date__isnull=True)
                    | models.Q(expected_completion_date__gte=models.F("expected_start_date"))
                ),
                name="lead_requirement_dates_valid",
            ),
        ]

    def clean(self):
        if self.lead_id:
            customized_product = self.lead.demos.filter(
                customization_required=True,
                completed_at__isnull=False,
            ).exists()
            if self.lead.lead_type != "SERVICE" and not customized_product:
                raise ValidationError("Requirements need a service lead or a completed customized-product demo.")
            if self.lead.lead_type == "SERVICE" and not self.service:
                raise ValidationError({"service": "Service is required for a service lead."})
        if self.meeting_id:
            if self.meeting.lead_id != self.lead_id:
                raise ValidationError({"meeting": "Requirement meeting must belong to the same lead."})
            expected_type = "SERVICE_REQUIREMENT" if self.lead.lead_type == "SERVICE" else "CUSTOMIZATION_REQUIREMENT"
            if self.meeting.meeting_type != expected_type:
                raise ValidationError({"meeting": f"Requirement must reference a {expected_type} meeting."})
        if self.expected_start_date and self.expected_completion_date and self.expected_completion_date < self.expected_start_date:
            raise ValidationError({"expected_completion_date": "Completion cannot precede the start date."})


class LeadRequirementItem(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="requirement_items")
    requirement = models.ForeignKey(
        ServiceRequirement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="items",
    )
    category = models.CharField(max_length=160, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="MEDIUM")
    feasibility = models.CharField(max_length=30, choices=FEASIBILITY_STATUS_CHOICES, default="PENDING")
    estimated_hours = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estimated_cost = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["id"]

    def clean(self):
        if self.requirement_id and self.requirement.lead_id != self.lead_id:
            raise ValidationError({"requirement": "Requirement item must belong to the same lead."})


class LeadCostEstimate(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="cost_estimates")
    prepared_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="prepared_lead_estimates",
    )
    development_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    product_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    infrastructure_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    implementation_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    support_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0, editable=False)
    internal_margin = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    approval_status = models.CharField(
        max_length=30,
        choices=APPROVAL_STATUS_CHOICES,
        default="DRAFT",
        db_index=True,
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_lead_estimates",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(development_cost__gte=0)
                    & models.Q(product_cost__gte=0)
                    & models.Q(infrastructure_cost__gte=0)
                    & models.Q(implementation_cost__gte=0)
                    & models.Q(support_cost__gte=0)
                    & models.Q(tax__gte=0)
                    & models.Q(discount__gte=0)
                    & models.Q(internal_margin__gte=0)
                    & models.Q(final_amount__gte=0)
                ),
                name="lead_estimate_amounts_nonnegative",
            )
        ]

    def clean(self):
        monetary_fields = [
            "development_cost", "product_cost", "infrastructure_cost", "implementation_cost",
            "support_cost", "tax", "discount", "internal_margin", "final_amount",
        ]
        errors = {field: "Amount cannot be negative." for field in monetary_fields if getattr(self, field, 0) < 0}
        if errors:
            raise ValidationError(errors)
        if self.approval_status == "APPROVED" and not self.approved_by_id:
            raise ValidationError({"approved_by": "Approved estimates require an approver."})

    def save(self, *args, **kwargs):
        components = [
            self.development_cost, self.product_cost, self.infrastructure_cost,
            self.implementation_cost, self.support_cost, self.tax,
        ]
        def _d(v):
            try:
                return Decimal(str(v)) if v is not None else Decimal("0")
            except Exception:
                return Decimal("0")
        self.total_cost = max(
            Decimal("0"),
            sum((_d(v) for v in components), Decimal("0")) - _d(self.discount),
        )
        if not self.final_amount:
            self.final_amount = self.total_cost
        return super().save(*args, **kwargs)


class LeadTask(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    task_type = models.CharField(max_length=50, choices=TASK_TYPE_CHOICES, default="OTHER", db_index=True)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="lead_tasks",
    )
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="MEDIUM", db_index=True)
    start_at = models.DateTimeField(null=True, blank=True)
    due_at = models.DateTimeField(null=True, blank=True, db_index=True)
    reminder_at = models.DateTimeField(null=True, blank=True, db_index=True)
    status = models.CharField(max_length=30, choices=TASK_STATUS_CHOICES, default="TODO", db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    completion_notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_lead_tasks",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["due_at", "id"]
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(start_at__isnull=True)
                    | models.Q(due_at__isnull=True)
                    | models.Q(due_at__gte=models.F("start_at"))
                ),
                name="lead_task_due_after_start",
            )
        ]

    def clean(self):
        if self.start_at and self.due_at and self.due_at < self.start_at:
            raise ValidationError({"due_at": "Task due time cannot precede its start."})


class LeadDocument(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="documents")
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES, default="OTHER", db_index=True)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to=lead_document_upload_to, validators=[validate_document_file])
    description = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_lead_documents",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at", "-id"]

    def __str__(self):
        return self.title


class LeadActivity(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="activities")
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPE_CHOICES, default="NOTE", db_index=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lead_activities",
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [models.Index(fields=["lead", "created_at"], name="activity_lead_created")]

    def save(self, *args, **kwargs):
        result = super().save(*args, **kwargs)
        event_time = self.created_at or timezone.now()
        Lead.objects.filter(pk=self.lead_id).filter(
            models.Q(last_activity_at__isnull=True) | models.Q(last_activity_at__lt=event_time)
        ).update(last_activity_at=event_time)
        return result


class LeadRejection(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="rejections")
    reason = models.CharField(max_length=50, choices=REJECTION_REASON_CHOICES, db_index=True)
    detailed_notes = models.TextField()
    competitor = models.CharField(max_length=255, blank=True)
    rejected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="rejected_leads",
    )
    rejected_at = models.DateTimeField(default=timezone.now, db_index=True)
    recontact_allowed = models.BooleanField(default=False)
    recontact_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-rejected_at", "-id"]

    def clean(self):
        if not self.detailed_notes.strip():
            raise ValidationError({"detailed_notes": "Detailed rejection notes are required."})
        if self.recontact_at and not self.recontact_allowed:
            raise ValidationError({"recontact_at": "Enable recontact before setting a recontact time."})


class LeadConversion(models.Model):
    lead = models.OneToOneField(Lead, on_delete=models.CASCADE, related_name="conversion")
    conversion_type = models.CharField(max_length=40, choices=CONVERSION_TYPE_CHOICES)
    customer = models.ForeignKey(
        "proposal.Client",
        on_delete=models.PROTECT,
        related_name="lead_conversions",
    )
    product = models.CharField(max_length=255, blank=True)
    service = models.CharField(max_length=255, blank=True)
    final_value = models.DecimalField(max_digits=14, decimal_places=2)
    discount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    payment_terms = models.TextField(blank=True)
    converted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="lead_conversions_completed",
    )
    converted_at = models.DateTimeField(default=timezone.now)
    quotation = models.ForeignKey(
        "proposal.Proposal",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lead_conversions",
    )
    invoice = models.ForeignKey(
        "invoice.Invoice",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lead_conversions",
    )
    project = models.CharField(max_length=255, blank=True, help_text="External/future project reference")
    sales_order = models.CharField(max_length=255, blank=True, help_text="External/future sales-order reference")
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-converted_at", "-id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(final_value__gte=0) & models.Q(discount__gte=0),
                name="lead_conversion_values_nonnegative",
            )
        ]

    def clean(self):
        if self.final_value < 0 or self.discount < 0:
            raise ValidationError("Conversion values cannot be negative.")


class EmailTemplate(models.Model):
    name = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.name


class EmailSmtpConfig(models.Model):
    sender_name = models.CharField(max_length=255, default="Adstra Digital Sales")
    sender_email = models.EmailField(default="sales@adstradigital.com")
    smtp_host = models.CharField(max_length=255, default="smtp.gmail.com")
    smtp_port = models.CharField(max_length=10, default="587")
    app_password = models.CharField(max_length=255, blank=True)
    use_tls = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    _ENCRYPTED_PREFIX = "enc:"

    @staticmethod
    def _cipher():
        digest = hashlib.sha256(settings.SECRET_KEY.encode("utf-8")).digest()
        return Fernet(base64.urlsafe_b64encode(digest))

    def set_app_password(self, value):
        raw = str(value or "")
        self.app_password = (
            f"{self._ENCRYPTED_PREFIX}{self._cipher().encrypt(raw.encode('utf-8')).decode('ascii')}"
            if raw
            else ""
        )

    def get_app_password(self):
        stored = str(self.app_password or "")
        if not stored:
            return ""
        if not stored.startswith(self._ENCRYPTED_PREFIX):
            # Backward compatibility for an existing plaintext value. The next
            # settings save upgrades it to encrypted storage.
            return stored
        try:
            return self._cipher().decrypt(
                stored[len(self._ENCRYPTED_PREFIX):].encode("ascii")
            ).decode("utf-8")
        except (InvalidToken, ValueError):
            return ""


class EmailAdvancedConfig(models.Model):
    signature = models.TextField(default="Best regards,\nAdstra Digital Team")
    track_opens = models.BooleanField(default=True)
    track_clicks = models.BooleanField(default=True)
    daily_limit = models.IntegerField(default=500)
    updated_at = models.DateTimeField(auto_now=True)


class SalesTeamConfig(models.Model):
    selected_designations = models.JSONField(
        default=list,
        blank=True,
        help_text="Selected designations to show in Sales & Marketing Team view.",
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"SalesTeamConfig ({len(self.selected_designations or [])} designations)"


class IncentiveUserConfig(models.Model):
    """Stores per-user incentive rate (%) and monthly target amount."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="incentive_config",
    )
    incentive_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10,
        help_text="Percentage of net conversion revenue paid as incentive.",
    )
    monthly_target = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Monthly sales target in INR (optional).",
    )
    notes = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"IncentiveConfig({self.user_id}) rate={self.incentive_rate}%"


PAYOUT_STATUS_CHOICES = [
    ("PENDING", "Pending"),
    ("APPROVED", "Approved"),
    ("PAID", "Paid"),
]


class IncentivePayout(models.Model):
    """Monthly incentive payout record per user (persisted, admin-approved)."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="incentive_payouts",
    )
    month = models.DateField(help_text="First day of the payout month (YYYY-MM-01).")
    gross_revenue = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    net_revenue = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    deal_count = models.PositiveIntegerField(default=0)
    incentive_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10)
    incentive_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    target_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    payout_status = models.CharField(
        max_length=20,
        choices=PAYOUT_STATUS_CHOICES,
        default="PENDING",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_incentive_payouts",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [("user", "month")]
        ordering = ["-month", "user__fullname"]

    def __str__(self):
        return f"Payout({self.user_id}, {self.month}, {self.payout_status})"

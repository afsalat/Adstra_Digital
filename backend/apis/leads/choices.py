"""Choice values shared by the lead-management domain.

The stored values intentionally use stable, uppercase identifiers.  API clients,
workflow services, migrations, and reports can therefore share the same values
without depending on display labels.
"""

from django.db import models


class LeadType(models.TextChoices):
    PRODUCT = "PRODUCT", "Product"
    SERVICE = "SERVICE", "Service"


class LeadTemperature(models.TextChoices):
    HOT = "HOT", "Hot"
    WARM = "WARM", "Warm"
    COLD = "COLD", "Cold"
    UNQUALIFIED = "UNQUALIFIED", "Unqualified"


class LeadStage(models.TextChoices):
    TARGETED = "TARGETED", "Targeted"
    NEW = "NEW", "New"
    ASSIGNED = "ASSIGNED", "Assigned"
    CONTACT_ATTEMPTED = "CONTACT_ATTEMPTED", "Contact Attempted"
    CONNECTED = "CONNECTED", "Connected"
    QUALIFIED = "QUALIFIED", "Qualified"
    FOLLOW_UP_REQUIRED = "FOLLOW_UP_REQUIRED", "Follow-up Required"
    DEMO_SCHEDULED = "DEMO_SCHEDULED", "Demo Scheduled"
    DEMO_COMPLETED = "DEMO_COMPLETED", "Demo Completed"
    CUSTOMIZATION_REQUIRED = "CUSTOMIZATION_REQUIRED", "Customization Required"
    REQUIREMENT_MEETING_SCHEDULED = (
        "REQUIREMENT_MEETING_SCHEDULED",
        "Requirement Meeting Scheduled",
    )
    REQUIREMENT_COLLECTED = "REQUIREMENT_COLLECTED", "Requirement Collected"
    TECHNICAL_REVIEW = "TECHNICAL_REVIEW", "Technical Review"
    FEASIBILITY_REVIEW = "FEASIBILITY_REVIEW", "Feasibility Review"
    COST_ESTIMATION = "COST_ESTIMATION", "Cost Estimation"
    PROPOSAL_PREPARATION = "PROPOSAL_PREPARATION", "Proposal Preparation"
    PROPOSAL_SENT = "PROPOSAL_SENT", "Proposal Sent"
    QUOTATION_SENT = "QUOTATION_SENT", "Quotation Sent"
    NEGOTIATION = "NEGOTIATION", "Negotiation"
    DECISION_PENDING = "DECISION_PENDING", "Decision Pending"
    CONVERTED = "CONVERTED", "Converted"
    REJECTED = "REJECTED", "Rejected"
    ON_HOLD = "ON_HOLD", "On Hold"
    LOST = "LOST", "Lost"


class Priority(models.TextChoices):
    LOW = "LOW", "Low"
    MEDIUM = "MEDIUM", "Medium"
    HIGH = "HIGH", "High"
    URGENT = "URGENT", "Urgent"


class TargetListStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    ACTIVE = "ACTIVE", "Active"
    PAUSED = "PAUSED", "Paused"
    COMPLETED = "COMPLETED", "Completed"
    ARCHIVED = "ARCHIVED", "Archived"


class CallDirection(models.TextChoices):
    INBOUND = "INBOUND", "Inbound"
    OUTBOUND = "OUTBOUND", "Outbound"


class CallOutcome(models.TextChoices):
    CONNECTED = "CONNECTED", "Connected"
    NO_ANSWER = "NO_ANSWER", "No Answer"
    BUSY = "BUSY", "Busy"
    SWITCHED_OFF = "SWITCHED_OFF", "Switched Off"
    INVALID_NUMBER = "INVALID_NUMBER", "Invalid Number"
    CALLBACK_REQUESTED = "CALLBACK_REQUESTED", "Callback Requested"
    INTERESTED = "INTERESTED", "Interested"
    NOT_INTERESTED = "NOT_INTERESTED", "Not Interested"
    DEMO_REQUESTED = "DEMO_REQUESTED", "Demo Requested"
    MEETING_REQUESTED = "MEETING_REQUESTED", "Meeting Requested"
    FOLLOW_UP_REQUIRED = "FOLLOW_UP_REQUIRED", "Follow-up Required"


class FollowUpType(models.TextChoices):
    PHONE = "PHONE", "Phone"
    WHATSAPP = "WHATSAPP", "WhatsApp"
    EMAIL = "EMAIL", "Email"
    MEETING = "MEETING", "Meeting"
    DEMO = "DEMO", "Demo"
    REQUIREMENT_DISCUSSION = "REQUIREMENT_DISCUSSION", "Requirement Discussion"
    SITE_VISIT = "SITE_VISIT", "Site Visit"
    PROPOSAL = "PROPOSAL", "Proposal"
    QUOTATION = "QUOTATION", "Quotation"
    PAYMENT = "PAYMENT", "Payment"


class FollowUpStatus(models.TextChoices):
    SCHEDULED = "SCHEDULED", "Scheduled"
    COMPLETED = "COMPLETED", "Completed"
    MISSED = "MISSED", "Missed"
    CANCELLED = "CANCELLED", "Cancelled"
    OVERDUE = "OVERDUE", "Overdue"


class MeetingType(models.TextChoices):
    PRODUCT_DEMO = "PRODUCT_DEMO", "Product Demo"
    PRODUCT_DISCUSSION = "PRODUCT_DISCUSSION", "Product Discussion"
    CUSTOMIZATION_REQUIREMENT = (
        "CUSTOMIZATION_REQUIREMENT",
        "Customization Requirement",
    )
    SERVICE_REQUIREMENT = "SERVICE_REQUIREMENT", "Service Requirement"
    TECHNICAL_DISCUSSION = "TECHNICAL_DISCUSSION", "Technical Discussion"
    SITE_VISIT = "SITE_VISIT", "Site Visit"
    PROPOSAL_DISCUSSION = "PROPOSAL_DISCUSSION", "Proposal Discussion"
    NEGOTIATION = "NEGOTIATION", "Negotiation"
    FOLLOW_UP = "FOLLOW_UP", "Follow-up"


class MeetingMode(models.TextChoices):
    ONLINE = "ONLINE", "Online"
    OFFICE = "OFFICE", "Office"
    CUSTOMER_LOCATION = "CUSTOMER_LOCATION", "Customer Location"
    PHONE = "PHONE", "Phone"


class MeetingStatus(models.TextChoices):
    SCHEDULED = "SCHEDULED", "Scheduled"
    CONFIRMED = "CONFIRMED", "Confirmed"
    RESCHEDULED = "RESCHEDULED", "Rescheduled"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"
    CUSTOMER_NO_SHOW = "CUSTOMER_NO_SHOW", "Customer No-show"
    TEAM_NO_SHOW = "TEAM_NO_SHOW", "Team No-show"


class DemoOutcome(models.TextChoices):
    HIGHLY_INTERESTED = "HIGHLY_INTERESTED", "Highly Interested"
    INTERESTED = "INTERESTED", "Interested"
    MORE_INFORMATION_REQUIRED = (
        "MORE_INFORMATION_REQUIRED",
        "More Information Required",
    )
    TRIAL_REQUESTED = "TRIAL_REQUESTED", "Trial Requested"
    CUSTOMIZATION_REQUIRED = "CUSTOMIZATION_REQUIRED", "Customization Required"
    PRICE_NEGOTIATION = "PRICE_NEGOTIATION", "Price Negotiation"
    DECISION_PENDING = "DECISION_PENDING", "Decision Pending"
    NOT_INTERESTED = "NOT_INTERESTED", "Not Interested"


class InterestLevel(models.TextChoices):
    VERY_HIGH = "VERY_HIGH", "Very High"
    HIGH = "HIGH", "High"
    MEDIUM = "MEDIUM", "Medium"
    LOW = "LOW", "Low"
    NONE = "NONE", "None"


class FeasibilityStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
    FEASIBLE = "FEASIBLE", "Feasible"
    FEASIBLE_WITH_CHANGES = "FEASIBLE_WITH_CHANGES", "Feasible with Changes"
    NOT_FEASIBLE = "NOT_FEASIBLE", "Not Feasible"


class RequirementStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    IN_PROGRESS = "IN_PROGRESS", "In Progress"
    COLLECTED = "COLLECTED", "Collected"
    UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
    CHANGES_REQUIRED = "CHANGES_REQUIRED", "Changes Required"
    APPROVED = "APPROVED", "Approved"
    COMPLETED = "COMPLETED", "Completed"


class ApprovalStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    PENDING = "PENDING", "Pending Approval"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"
    REVISION_REQUIRED = "REVISION_REQUIRED", "Revision Required"


class TaskType(models.TextChoices):
    CALL = "CALL", "Call"
    FOLLOW_UP = "FOLLOW_UP", "Follow-up"
    MEETING = "MEETING", "Meeting"
    DEMO = "DEMO", "Demo"
    CUSTOMIZATION_REQUIREMENT = (
        "CUSTOMIZATION_REQUIREMENT",
        "Customization Requirement",
    )
    REQUIREMENT_COLLECTION = "REQUIREMENT_COLLECTION", "Requirement Collection"
    SITE_VISIT = "SITE_VISIT", "Site Visit"
    TECHNICAL_REVIEW = "TECHNICAL_REVIEW", "Technical Review"
    FEASIBILITY_REVIEW = "FEASIBILITY_REVIEW", "Feasibility Review"
    COST_ESTIMATION = "COST_ESTIMATION", "Cost Estimation"
    APPROVAL = "APPROVAL", "Approval"
    PROPOSAL = "PROPOSAL", "Proposal"
    QUOTATION = "QUOTATION", "Quotation"
    PAYMENT = "PAYMENT", "Payment"
    OTHER = "OTHER", "Other"


class TaskStatus(models.TextChoices):
    TODO = "TODO", "To Do"
    IN_PROGRESS = "IN_PROGRESS", "In Progress"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"
    OVERDUE = "OVERDUE", "Overdue"


class DocumentType(models.TextChoices):
    COMPANY_PROFILE = "COMPANY_PROFILE", "Company Profile"
    REQUIREMENT = "REQUIREMENT", "Requirement"
    MEETING_MINUTES = "MEETING_MINUTES", "Meeting Minutes"
    TECHNICAL = "TECHNICAL", "Technical"
    COST_ESTIMATE = "COST_ESTIMATE", "Cost Estimate"
    PROPOSAL = "PROPOSAL", "Proposal"
    QUOTATION = "QUOTATION", "Quotation"
    CONTRACT = "CONTRACT", "Contract"
    INVOICE = "INVOICE", "Invoice"
    PAYMENT = "PAYMENT", "Payment"
    OTHER = "OTHER", "Other"


class ActivityType(models.TextChoices):
    CREATED = "CREATED", "Created"
    UPDATED = "UPDATED", "Updated"
    IMPORTED = "IMPORTED", "Imported"
    ASSIGNED = "ASSIGNED", "Assigned"
    REASSIGNED = "REASSIGNED", "Reassigned"
    CALL = "CALL", "Call"
    FOLLOW_UP = "FOLLOW_UP", "Follow-up"
    MEETING = "MEETING", "Meeting"
    DEMO = "DEMO", "Demo"
    REQUIREMENT = "REQUIREMENT", "Requirement"
    TECHNICAL_REVIEW = "TECHNICAL_REVIEW", "Technical Review"
    COST_ESTIMATE = "COST_ESTIMATE", "Cost Estimate"
    APPROVAL = "APPROVAL", "Approval"
    PROPOSAL = "PROPOSAL", "Proposal"
    QUOTATION = "QUOTATION", "Quotation"
    TASK = "TASK", "Task"
    DOCUMENT = "DOCUMENT", "Document"
    NOTE = "NOTE", "Note"
    STAGE_CHANGED = "STAGE_CHANGED", "Stage Changed"
    PUT_ON_HOLD = "PUT_ON_HOLD", "Put on Hold"
    RESUMED = "RESUMED", "Resumed"
    REJECTED = "REJECTED", "Rejected"
    REOPENED = "REOPENED", "Reopened"
    CONVERTED = "CONVERTED", "Converted"
    EXPORTED = "EXPORTED", "Exported"
    BULK_ACTION = "BULK_ACTION", "Bulk Action"
    AUTOMATION = "AUTOMATION", "Automation"


class RejectionReason(models.TextChoices):
    NOT_INTERESTED = "NOT_INTERESTED", "Not Interested"
    INVALID_CONTACT = "INVALID_CONTACT", "Invalid Contact"
    NO_REQUIREMENT = "NO_REQUIREMENT", "No Requirement"
    BUDGET_ISSUE = "BUDGET_ISSUE", "Budget Issue"
    PRICE_TOO_HIGH = "PRICE_TOO_HIGH", "Price Too High"
    COMPETITOR_SELECTED = "COMPETITOR_SELECTED", "Competitor Selected"
    REQUIREMENT_POSTPONED = "REQUIREMENT_POSTPONED", "Requirement Postponed"
    UNABLE_TO_CONTACT = "UNABLE_TO_CONTACT", "Unable to Contact"
    OUTSIDE_SERVICE_AREA = "OUTSIDE_SERVICE_AREA", "Outside Service Area"
    PRODUCT_UNAVAILABLE = "PRODUCT_UNAVAILABLE", "Product Unavailable"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE", "Service Unavailable"
    DUPLICATE = "DUPLICATE", "Duplicate"
    CUSTOMER_CANCELLED = "CUSTOMER_CANCELLED", "Customer Cancelled"
    NOT_FEASIBLE = "NOT_FEASIBLE", "Not Feasible"
    OTHER = "OTHER", "Other"


class ConversionType(models.TextChoices):
    PRODUCT_ORDER = "PRODUCT_ORDER", "Product Order"
    SERVICE_ORDER = "SERVICE_ORDER", "Service Order"
    PROJECT = "PROJECT", "Project"


# Model-field aliases.  Keeping these names independent of the enum classes
# makes imports concise and preserves a stable contract for migrations.
LEAD_TYPE_CHOICES = tuple(LeadType.choices)
LEAD_TEMPERATURE_CHOICES = tuple(LeadTemperature.choices)
LEAD_STAGE_CHOICES = tuple(LeadStage.choices)
PRIORITY_CHOICES = tuple(Priority.choices)
TARGET_LIST_STATUS_CHOICES = tuple(TargetListStatus.choices)
CALL_DIRECTION_CHOICES = tuple(CallDirection.choices)
CALL_OUTCOME_CHOICES = tuple(CallOutcome.choices)
FOLLOW_UP_TYPE_CHOICES = tuple(FollowUpType.choices)
FOLLOW_UP_STATUS_CHOICES = tuple(FollowUpStatus.choices)
MEETING_TYPE_CHOICES = tuple(MeetingType.choices)
MEETING_MODE_CHOICES = tuple(MeetingMode.choices)
MEETING_STATUS_CHOICES = tuple(MeetingStatus.choices)
DEMO_OUTCOME_CHOICES = tuple(DemoOutcome.choices)
INTEREST_LEVEL_CHOICES = tuple(InterestLevel.choices)
FEASIBILITY_STATUS_CHOICES = tuple(FeasibilityStatus.choices)
REQUIREMENT_STATUS_CHOICES = tuple(RequirementStatus.choices)
APPROVAL_STATUS_CHOICES = tuple(ApprovalStatus.choices)
TASK_TYPE_CHOICES = tuple(TaskType.choices)
TASK_STATUS_CHOICES = tuple(TaskStatus.choices)
DOCUMENT_TYPE_CHOICES = tuple(DocumentType.choices)
ACTIVITY_TYPE_CHOICES = tuple(ActivityType.choices)
REJECTION_REASON_CHOICES = tuple(RejectionReason.choices)
CONVERSION_TYPE_CHOICES = tuple(ConversionType.choices)


TERMINAL_LEAD_STAGES = frozenset(
    {LeadStage.CONVERTED.value, LeadStage.REJECTED.value, LeadStage.LOST.value}
)
REOPENABLE_LEAD_STAGES = frozenset(
    {LeadStage.REJECTED.value, LeadStage.LOST.value}
)
ACTIVE_LEAD_STAGES = frozenset(
    stage.value
    for stage in LeadStage
    if stage.value not in TERMINAL_LEAD_STAGES and stage is not LeadStage.ON_HOLD
)
HOLDABLE_LEAD_STAGES = ACTIVE_LEAD_STAGES

PRODUCT_WORKFLOW_STAGES = frozenset(
    {
        LeadStage.DEMO_SCHEDULED.value,
        LeadStage.DEMO_COMPLETED.value,
        LeadStage.CUSTOMIZATION_REQUIRED.value,
    }
)
REQUIREMENT_WORKFLOW_STAGES = frozenset(
    {
        LeadStage.REQUIREMENT_MEETING_SCHEDULED.value,
        LeadStage.REQUIREMENT_COLLECTED.value,
        LeadStage.TECHNICAL_REVIEW.value,
        LeadStage.FEASIBILITY_REVIEW.value,
    }
)
COMMERCIAL_WORKFLOW_STAGES = frozenset(
    {
        LeadStage.COST_ESTIMATION.value,
        LeadStage.PROPOSAL_PREPARATION.value,
        LeadStage.PROPOSAL_SENT.value,
        LeadStage.QUOTATION_SENT.value,
        LeadStage.NEGOTIATION.value,
        LeadStage.DECISION_PENDING.value,
    }
)


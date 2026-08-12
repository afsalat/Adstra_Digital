from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.urls import reverse
from django.utils import timezone
from rest_framework import serializers

from apis.proposal.models import Client
from apis.user.models import CustomUser

from .choices import (
    CONVERSION_TYPE_CHOICES,
    LEAD_STAGE_CHOICES,
    REJECTION_REASON_CHOICES,
)
from .models import (
    Lead,
    LeadActivity,
    LeadAssignmentHistory,
    LeadCall,
    LeadConversion,
    LeadCostEstimate,
    LeadDocument,
    LeadFollowUp,
    LeadMeeting,
    LeadRejection,
    LeadRequirementItem,
    LeadTask,
    ProductDemo,
    ServiceRequirement,
    TargetCustomer,
    TargetCustomerList,
)
from .validators import normalize_phone


def _drf_validation_error(exc):
    if hasattr(exc, "message_dict"):
        return serializers.ValidationError(exc.message_dict)
    return serializers.ValidationError(getattr(exc, "messages", [str(exc)]))


def _normalize_contact_values(attrs):
    normalized = dict(attrs)
    for field in ("phone", "whatsapp_number"):
        if field in normalized:
            value = normalized.get(field)
            normalized[field] = normalize_phone(value) if value else ""
    if "email" in normalized:
        normalized["email"] = str(normalized.get("email") or "").strip().lower()
    return normalized


class FullCleanModelSerializer(serializers.ModelSerializer):
    """Make Django model invariants authoritative for every API write."""

    def create(self, validated_data):
        model = self.Meta.model
        instance = model(**validated_data)
        try:
            instance.full_clean()
            with transaction.atomic():
                instance.save()
        except DjangoValidationError as exc:
            raise _drf_validation_error(exc) from exc
        except IntegrityError as exc:
            raise serializers.ValidationError(
                {"duplicate": "A record with this phone, WhatsApp number, or email already exists."}
            ) from exc
        return instance

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        try:
            instance.full_clean()
            with transaction.atomic():
                instance.save()
        except DjangoValidationError as exc:
            raise _drf_validation_error(exc) from exc
        except IntegrityError as exc:
            raise serializers.ValidationError(
                {"duplicate": "A record with this phone, WhatsApp number, or email already exists."}
            ) from exc
        return instance


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("id", "username", "fullname", "email", "role", "department", "is_team_lead")
        read_only_fields = fields


class ClientSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ("id", "company_name", "name", "email", "contact", "gstin", "address")
        read_only_fields = fields


class TargetCustomerListSerializer(FullCleanModelSerializer):
    created_by_name = serializers.CharField(source="created_by.fullname", read_only=True)
    customer_count = serializers.SerializerMethodField()

    class Meta:
        model = TargetCustomerList
        fields = "__all__"
        read_only_fields = ("id", "created_by", "created_at", "updated_at")

    def get_customer_count(self, obj):
        prefetched = getattr(obj, "_prefetched_objects_cache", {}).get("customers")
        return len(prefetched) if prefetched is not None else obj.customers.count()


class TargetCustomerSerializer(FullCleanModelSerializer):
    assigned_to_name = serializers.CharField(source="assigned_to.fullname", read_only=True)
    customer_list_name = serializers.CharField(source="customer_list.name", read_only=True)

    class Meta:
        model = TargetCustomer
        fields = "__all__"
        read_only_fields = ("id", "assigned_to", "imported_at", "created_at", "updated_at")

    def validate(self, attrs):
        attrs = _normalize_contact_values(attrs)
        phone = attrs.get("phone", getattr(self.instance, "phone", ""))
        whatsapp = attrs.get("whatsapp_number", getattr(self.instance, "whatsapp_number", ""))
        email = attrs.get("email", getattr(self.instance, "email", ""))
        queryset = TargetCustomer.objects.all()
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        duplicate_filter = Q()
        for number in {value for value in (phone, whatsapp) if value}:
            duplicate_filter |= Q(phone=number) | Q(whatsapp_number=number)
        if email:
            duplicate_filter |= Q(email__iexact=email)
        if duplicate_filter and queryset.filter(duplicate_filter).exists():
            raise serializers.ValidationError(
                {"duplicate": "A target customer with this phone or email already exists."}
            )
        return attrs


class LeadSerializer(FullCleanModelSerializer):
    created_by_name = serializers.CharField(source="created_by.fullname", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.fullname", read_only=True)
    assigned_by_name = serializers.CharField(source="assigned_by.fullname", read_only=True)
    customer_record = ClientSummarySerializer(source="customer", read_only=True)
    quotation_number = serializers.CharField(source="quotation.proposal_no", read_only=True)
    do_not_call = serializers.BooleanField(read_only=True)
    target_list_id = serializers.IntegerField(source="target_customer.customer_list_id", read_only=True)
    target_list_name = serializers.CharField(source="target_customer.customer_list.name", read_only=True)
    allowed_transitions = serializers.SerializerMethodField()
    last_follow_up = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = "__all__"
        read_only_fields = (
            "id",
            "lead_number",
            "target_customer",
            "customer",
            "quotation",
            "assigned_to",
            "current_stage",
            "stage_before_hold",
            "assigned_by",
            "last_activity_at",
            "created_by",
            "created_at",
            "updated_at",
        )

    def get_allowed_transitions(self, obj):
        from .services import LeadWorkflowService

        return LeadWorkflowService.allowed_transitions(obj)

    def get_last_follow_up(self, obj):
        prefetched = getattr(obj, "_prefetched_objects_cache", {}).get("follow_ups")
        follow_ups = list(prefetched) if prefetched is not None else None
        latest = (
            sorted(
                follow_ups,
                key=lambda item: (
                    item.completed_at or item.scheduled_at or item.created_at,
                    item.id,
                ),
                reverse=True,
            )[0]
            if follow_ups
            else obj.follow_ups.select_related("assigned_to", "created_by")
                .order_by("-completed_at", "-scheduled_at", "-created_at", "-id")
                .first()
        )
        if not latest:
            return None
        return {
            "id": latest.id,
            "follow_up_type": latest.follow_up_type,
            "status": latest.status,
            "scheduled_at": latest.scheduled_at,
            "completed_at": latest.completed_at,
            "next_follow_up_at": latest.next_follow_up_at,
            "purpose": latest.purpose,
            "result": latest.result,
            "notes": latest.notes,
            "assigned_to_name": latest.assigned_to.fullname if latest.assigned_to else "",
            "created_by_name": latest.created_by.fullname if latest.created_by else "",
            "created_at": latest.created_at,
        }

    def validate(self, attrs):
        if "current_stage" in getattr(self, "initial_data", {}):
            raise serializers.ValidationError(
                {"current_stage": "Use the transition endpoint to change a lead stage."}
            )
        attrs = _normalize_contact_values(attrs)
        phone = attrs.get("phone", getattr(self.instance, "phone", ""))
        whatsapp = attrs.get("whatsapp_number", getattr(self.instance, "whatsapp_number", ""))
        email = attrs.get("email", getattr(self.instance, "email", ""))
        target_customer = attrs.get("target_customer", getattr(self.instance, "target_customer", None))

        lead_matches = Lead.objects.all()
        if self.instance:
            lead_matches = lead_matches.exclude(pk=self.instance.pk)
        duplicate_filter = Q()
        for number in {value for value in (phone, whatsapp) if value}:
            duplicate_filter |= Q(phone=number) | Q(whatsapp_number=number)
        if email:
            duplicate_filter |= Q(email__iexact=email)
        if duplicate_filter and lead_matches.filter(duplicate_filter).exists():
            raise serializers.ValidationError(
                {"duplicate": "A lead with this phone, WhatsApp number, or email already exists."}
            )

        target_matches = TargetCustomer.objects.all()
        if target_customer:
            target_matches = target_matches.exclude(pk=target_customer.pk)
        if duplicate_filter and target_matches.filter(duplicate_filter).exists():
            raise serializers.ValidationError(
                {"duplicate": "A target customer with this phone or email already exists."}
            )
        return attrs


class LeadAssignmentHistorySerializer(serializers.ModelSerializer):
    assigned_from_name = serializers.CharField(source="assigned_from.fullname", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.fullname", read_only=True)
    assigned_by_name = serializers.CharField(source="assigned_by.fullname", read_only=True)

    class Meta:
        model = LeadAssignmentHistory
        fields = "__all__"
        read_only_fields = (
            "id", "lead", "assigned_from", "assigned_to", "assigned_by", "reason", "assigned_at",
        )


class LeadCallSerializer(FullCleanModelSerializer):
    caller_name = serializers.CharField(source="caller.fullname", read_only=True)

    class Meta:
        model = LeadCall
        fields = "__all__"
        read_only_fields = ("id", "lead", "caller", "duration_seconds", "created_at")


class LeadFollowUpSerializer(FullCleanModelSerializer):
    assigned_to_name = serializers.CharField(source="assigned_to.fullname", read_only=True)
    created_by_name = serializers.CharField(source="created_by.fullname", read_only=True)

    class Meta:
        model = LeadFollowUp
        fields = "__all__"
        read_only_fields = ("id", "lead", "created_by", "created_at")
        extra_kwargs = {"assigned_to": {"required": False, "allow_null": True}}


class LeadMeetingSerializer(FullCleanModelSerializer):
    assigned_to_name = serializers.CharField(source="assigned_to.fullname", read_only=True)
    created_by_name = serializers.CharField(source="created_by.fullname", read_only=True)

    class Meta:
        model = LeadMeeting
        fields = "__all__"
        read_only_fields = ("id", "lead", "created_by", "created_at", "updated_at")
        extra_kwargs = {"assigned_to": {"required": False, "allow_null": True}}


class ProductDemoSerializer(FullCleanModelSerializer):
    presented_by_name = serializers.CharField(source="presented_by.fullname", read_only=True)

    class Meta:
        model = ProductDemo
        fields = "__all__"
        read_only_fields = ("id", "lead")
        extra_kwargs = {"presented_by": {"required": False, "allow_null": True}}


class ServiceRequirementSerializer(FullCleanModelSerializer):
    created_by_name = serializers.CharField(source="created_by.fullname", read_only=True)

    class Meta:
        model = ServiceRequirement
        fields = "__all__"
        read_only_fields = ("id", "lead", "created_by", "created_at", "updated_at")
        extra_kwargs = {"service": {"required": False, "allow_blank": True}}


class LeadRequirementItemSerializer(FullCleanModelSerializer):
    class Meta:
        model = LeadRequirementItem
        fields = "__all__"
        read_only_fields = ("id", "lead")


class LeadCostEstimateSerializer(FullCleanModelSerializer):
    prepared_by_name = serializers.CharField(source="prepared_by.fullname", read_only=True)
    approved_by_name = serializers.CharField(source="approved_by.fullname", read_only=True)

    class Meta:
        model = LeadCostEstimate
        fields = "__all__"
        read_only_fields = (
            "id",
            "lead",
            "prepared_by",
            "total_cost",
            "approved_by",
            "approved_at",
            "created_at",
            "updated_at",
        )


class LeadTaskSerializer(FullCleanModelSerializer):
    assigned_to_name = serializers.CharField(source="assigned_to.fullname", read_only=True)
    created_by_name = serializers.CharField(source="created_by.fullname", read_only=True)

    class Meta:
        model = LeadTask
        fields = "__all__"
        read_only_fields = ("id", "lead", "created_by", "created_at")
        extra_kwargs = {"assigned_to": {"required": False, "allow_null": True}}


class LeadDocumentSerializer(FullCleanModelSerializer):
    file = serializers.FileField(write_only=True)
    download_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(source="uploaded_by.fullname", read_only=True)

    class Meta:
        model = LeadDocument
        fields = (
            "id",
            "lead",
            "document_type",
            "title",
            "file",
            "description",
            "uploaded_by",
            "uploaded_by_name",
            "uploaded_at",
            "download_url",
        )
        read_only_fields = ("id", "lead", "uploaded_by", "uploaded_at", "download_url")

    def get_download_url(self, obj):
        path = reverse(
            "leads:lead-document-download",
            kwargs={"pk": obj.lead_id, "document_id": obj.pk},
        )
        request = self.context.get("request")
        return request.build_absolute_uri(path) if request else path


class LeadActivitySerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.fullname", read_only=True)

    class Meta:
        model = LeadActivity
        fields = "__all__"
        read_only_fields = ("id", "lead", "activity_type", "title", "description", "actor", "metadata", "created_at")


class LeadRejectionSerializer(serializers.ModelSerializer):
    rejected_by_name = serializers.CharField(source="rejected_by.fullname", read_only=True)

    class Meta:
        model = LeadRejection
        fields = "__all__"
        read_only_fields = (
            "id", "lead", "reason", "detailed_notes", "competitor", "rejected_by",
            "rejected_at", "recontact_allowed", "recontact_at",
        )


class LeadConversionSerializer(serializers.ModelSerializer):
    customer_record = ClientSummarySerializer(source="customer", read_only=True)
    converted_by_name = serializers.CharField(source="converted_by.fullname", read_only=True)
    quotation_number = serializers.CharField(source="quotation.proposal_no", read_only=True)
    invoice_number = serializers.CharField(source="invoice.invoice_no", read_only=True)

    class Meta:
        model = LeadConversion
        fields = "__all__"
        read_only_fields = (
            "id", "lead", "conversion_type", "customer", "product", "service", "final_value",
            "discount", "payment_terms", "converted_by", "converted_at", "quotation", "invoice",
            "project", "sales_order", "notes",
        )


class LeadAssignmentActionSerializer(serializers.Serializer):
    assigned_to = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.filter(is_active=True))
    reason = serializers.CharField(required=False, allow_blank=True, max_length=1000)


class LeadTransitionSerializer(serializers.Serializer):
    target_stage = serializers.ChoiceField(choices=LEAD_STAGE_CHOICES)
    reason = serializers.CharField(required=False, allow_blank=True, max_length=2000)


class LeadQualifySerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, max_length=2000)


class LeadRejectSerializer(serializers.Serializer):
    reason = serializers.ChoiceField(choices=REJECTION_REASON_CHOICES)
    detailed_notes = serializers.CharField(allow_blank=False, trim_whitespace=True, max_length=10000)
    competitor = serializers.CharField(required=False, allow_blank=True, max_length=255)
    recontact_allowed = serializers.BooleanField(required=False, default=False)
    recontact_at = serializers.DateTimeField(required=False, allow_null=True)

    def validate(self, attrs):
        recontact_at = attrs.get("recontact_at")
        if recontact_at and (not attrs.get("recontact_allowed") or recontact_at <= timezone.now()):
            raise serializers.ValidationError(
                {"recontact_at": "Enable recontact and choose a future time."}
            )
        return attrs


class LeadReopenSerializer(serializers.Serializer):
    reason = serializers.CharField(allow_blank=False, trim_whitespace=True, max_length=4000)


class LeadConvertSerializer(serializers.Serializer):
    conversion_type = serializers.ChoiceField(choices=CONVERSION_TYPE_CHOICES, required=False)
    customer_id = serializers.IntegerField(required=False, min_value=1)
    confirm_create_customer = serializers.BooleanField(required=False, default=False)
    gstin = serializers.CharField(required=False, allow_blank=True, max_length=50)
    lut = serializers.CharField(required=False, allow_blank=True, max_length=50)
    final_value = serializers.DecimalField(required=False, max_digits=14, decimal_places=2, min_value=0)
    discount = serializers.DecimalField(required=False, max_digits=14, decimal_places=2, min_value=0)
    payment_terms = serializers.CharField(required=False, allow_blank=True, max_length=5000)
    create_invoice = serializers.BooleanField(required=False, default=False)
    project = serializers.CharField(required=False, allow_blank=True, max_length=255)
    sales_order = serializers.CharField(required=False, allow_blank=True, max_length=255)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=10000)


class LeadCostEstimateApprovalSerializer(serializers.Serializer):
    approval_status = serializers.ChoiceField(choices=("APPROVED", "REJECTED", "REVISION_REQUIRED"))
    notes = serializers.CharField(required=False, allow_blank=True, max_length=5000)


class LeadImportActionSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=("targets", "leads"), default="targets")
    file = serializers.FileField(required=False)
    rows = serializers.JSONField(required=False)
    customer_list = serializers.PrimaryKeyRelatedField(
        queryset=TargetCustomerList.objects.all(),
        required=False,
        allow_null=True,
    )
    dry_run = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        if not attrs.get("file") and not attrs.get("rows"):
            raise serializers.ValidationError("Upload a CSV file or provide a rows array.")
        if attrs.get("rows") is not None and not isinstance(attrs["rows"], list):
            raise serializers.ValidationError({"rows": "Rows must be an array of objects."})
        if attrs.get("mode") == "targets" and not attrs.get("customer_list"):
            raise serializers.ValidationError({"customer_list": "A target customer list is required."})
        return attrs

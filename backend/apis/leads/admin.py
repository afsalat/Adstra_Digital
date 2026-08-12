from django.contrib import admin

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


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        "lead_number", "contact_person", "company_name", "lead_type",
        "current_stage", "priority", "assigned_to", "next_follow_up_at",
    )
    list_filter = ("lead_type", "current_stage", "priority", "temperature", "source")
    search_fields = ("lead_number", "contact_person", "company_name", "email", "phone", "product", "service")
    readonly_fields = ("lead_number", "current_stage", "last_activity_at", "created_at", "updated_at")
    list_select_related = ("assigned_to", "created_by", "customer")


@admin.register(TargetCustomerList)
class TargetCustomerListAdmin(admin.ModelAdmin):
    list_display = ("name", "campaign", "source", "assigned_team", "status", "created_by", "updated_at")
    list_filter = ("status", "source", "assigned_team")
    search_fields = ("name", "campaign", "description")


@admin.register(TargetCustomer)
class TargetCustomerAdmin(admin.ModelAdmin):
    list_display = ("company_name", "customer_name", "contact_person", "phone", "priority", "assigned_to", "do_not_call")
    list_filter = ("priority", "source", "do_not_call", "state")
    search_fields = ("company_name", "customer_name", "contact_person", "phone", "email")
    list_select_related = ("customer_list", "assigned_to")


for model in (
    LeadAssignmentHistory,
    LeadCall,
    LeadFollowUp,
    LeadMeeting,
    ProductDemo,
    ServiceRequirement,
    LeadRequirementItem,
    LeadCostEstimate,
    LeadTask,
    LeadDocument,
    LeadActivity,
    LeadRejection,
    LeadConversion,
):
    admin.site.register(model)


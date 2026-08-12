from django.urls import path

from . import views


app_name = "leads"

urlpatterns = [
    path("", views.lead_list_create, name="lead-list-create"),
    path("<int:pk>/", views.lead_detail, name="lead-detail"),
    path("<int:pk>/assign/", views.assign_lead, name="lead-assign"),
    path("<int:pk>/reassign/", views.reassign_lead, name="lead-reassign"),
    path("<int:pk>/qualify/", views.qualify_lead, name="lead-qualify"),
    path("<int:pk>/transition/", views.transition_lead, name="lead-transition"),
    path("<int:pk>/convert/", views.convert_lead, name="lead-convert"),
    path("<int:pk>/reject/", views.reject_lead, name="lead-reject"),
    path("<int:pk>/reopen/", views.reopen_lead, name="lead-reopen"),
    path("<int:pk>/timeline/", views.lead_timeline, name="lead-timeline"),
    path("<int:pk>/calls/", views.lead_calls, name="lead-calls"),
    path("<int:pk>/follow-ups/", views.lead_follow_ups, name="lead-follow-ups"),
    path("<int:pk>/meetings/", views.lead_meetings, name="lead-meetings"),
    path("<int:pk>/demo/", views.lead_demo, name="lead-demo"),
    path("<int:pk>/requirements/", views.lead_requirements, name="lead-requirements"),
    path("<int:pk>/cost-estimates/", views.lead_cost_estimates, name="lead-cost-estimates"),
    path("<int:pk>/tasks/", views.lead_tasks, name="lead-tasks"),
    path("<int:pk>/documents/", views.lead_documents, name="lead-documents"),
    path(
        "<int:pk>/documents/<int:document_id>/download/",
        views.download_lead_document,
        name="lead-document-download",
    ),
    path("<int:pk>/quotation/", views.lead_quotation, name="lead-quotation"),
    path("<int:pk>/send-email/", views.lead_send_email, name="lead-send-email"),

    # Email Settings & Templates endpoints
    path("email-templates/", views.email_templates_api, name="email-templates"),
    path("email-templates/<int:pk>/", views.email_template_detail_api, name="email-template-detail"),
    path("email-smtp/", views.email_smtp_config_api, name="email-smtp"),
    path("email-advanced/", views.email_advanced_config_api, name="email-advanced"),

    # Export endpoints
    path("lead-export/", views.lead_export, name="lead-export-scoped"),
    path("export/", views.lead_export, name="export-scoped"),

    # Root Lead Management endpoints (available directly under /leads/ prefix as well)
    path("lead-lists/", views.target_customer_lists, name="lead-list-collection-scoped"),
    path("lead-lists/<int:pk>/", views.target_customer_list_detail, name="lead-list-detail-scoped"),
    path("lead-lists/<int:pk>/convert-to-leads/", views.target_customer_list_convert_to_leads, name="lead-list-convert-scoped"),
    path("target-customers/", views.target_customers, name="target-customer-collection-scoped"),
    path("target-customers/<int:pk>/", views.target_customer_detail, name="target-customer-detail-scoped"),
    path("lead-import/", views.lead_import, name="lead-import-scoped"),
    path("lead-dashboard/", views.lead_dashboard, name="lead-dashboard-scoped"),
    path("lead-reports/", views.lead_report_view, name="lead-reports-scoped"),
    path("lead-my-profile/", views.lead_my_profile, name="lead-my-profile-scoped"),
    path("lead-my-profile/target-lists/<int:pk>/contacts/", views.lead_my_profile_target_contacts, name="lead-my-profile-target-contacts-scoped"),
    path("lead-my-profile/target-lists/<int:pk>/contacts/<int:contact_id>/", views.lead_my_profile_target_contact_detail, name="lead-my-profile-target-contact-detail-scoped"),
    path("lead-my-profile/target-lists/<int:pk>/convert-to-leads/", views.lead_my_profile_target_list_convert, name="lead-my-profile-target-convert-scoped"),
    path("tele-sales-users/", views.tele_sales_users, name="tele-sales-users-scoped"),
    path("tele-sales-report/<int:user_id>/", views.tele_sales_user_report, name="tele-sales-report-scoped"),

    # Compatibility routes retained for the existing basic frontend scaffold.
    path("create/", views.lead_list_create, name="legacy-lead-create"),
    path("update/<int:pk>/", views.lead_detail, name="legacy-lead-update"),
    path("delete/<int:pk>/", views.lead_detail, name="legacy-lead-delete"),
]

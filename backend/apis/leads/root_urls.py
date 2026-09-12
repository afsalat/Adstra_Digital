from django.urls import path

from . import views


app_name = "lead_management_root"

urlpatterns = [
    path("lead-lists/", views.target_customer_lists, name="lead-list-collection"),
    path("lead-lists/<int:pk>/", views.target_customer_list_detail, name="lead-list-detail"),
    path("lead-lists/<int:pk>/convert-to-leads/", views.target_customer_list_convert_to_leads, name="lead-list-convert-to-leads"),
    path("target-customers/", views.target_customers, name="target-customer-collection"),
    path("target-customers/<int:pk>/", views.target_customer_detail, name="target-customer-detail"),
    path("lead-import/", views.lead_import, name="lead-import"),
    path("lead-export/", views.lead_export, name="lead-export"),
    path("lead-dashboard/", views.lead_dashboard, name="lead-dashboard"),
    path("lead-reports/", views.lead_report_view, name="lead-reports"),
    path("meetings/", views.all_lead_meetings, name="all-lead-meetings"),
    path("lead-my-profile/", views.lead_my_profile, name="lead-my-profile"),
    path("lead-my-profile/target-lists/<int:pk>/contacts/", views.lead_my_profile_target_contacts, name="lead-my-profile-target-contacts"),
    path("lead-my-profile/target-lists/<int:pk>/contacts/<int:contact_id>/", views.lead_my_profile_target_contact_detail, name="lead-my-profile-target-contact-detail"),
    path("lead-my-profile/target-lists/<int:pk>/convert-to-leads/", views.lead_my_profile_target_list_convert, name="lead-my-profile-target-convert"),
    path("tele-sales-users/", views.tele_sales_users, name="tele-sales-users"),
    path("tele-sales-report/<int:user_id>/", views.tele_sales_user_report, name="tele-sales-report"),
    # Incentive endpoints
    path("incentive-config/", views.incentive_config, name="incentive-config"),
    path("incentive-summary/", views.incentive_summary, name="incentive-summary"),
    path("incentive-payouts/", views.incentive_payouts, name="incentive-payouts"),
    path("incentive-payouts/<int:pk>/", views.incentive_payout_detail, name="incentive-payout-detail"),
]

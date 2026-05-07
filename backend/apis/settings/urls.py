from django.urls import path
from .views import company_settings_view, export_backup, import_backup, audit_logs_view

urlpatterns = [
    path('', company_settings_view, name='company-settings'),
    path('logs/', audit_logs_view, name='audit-logs'),
    path('backup/export/', export_backup, name='export-backup'),
    path('backup/import/', import_backup, name='import-backup'),
]

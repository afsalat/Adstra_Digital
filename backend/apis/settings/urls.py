from django.urls import path
from .views import company_settings_view, export_backup, import_backup

urlpatterns = [
    path('', company_settings_view, name='company-settings'),
    path('backup/export/', export_backup, name='export-backup'),
    path('backup/import/', import_backup, name='import-backup'),
]

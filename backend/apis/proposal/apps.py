from django.apps import AppConfig

class ProposalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apis.proposal'  # ✅ must match folder structure

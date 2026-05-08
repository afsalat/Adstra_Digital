import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import logging
from apis.user.models import CustomUser

logger = logging.getLogger(__name__)

for u in CustomUser.objects.all().values('id','username','is_superuser','is_staff','role','is_active'):
    logger.info(u)

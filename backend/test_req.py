import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import logging
from utils.jwt_helper import generate_jwt
from apis.user.models import CustomUser
import requests

logger = logging.getLogger(__name__)

u = CustomUser.objects.filter(is_superuser=True).first()
token = generate_jwt(u.id)

headers = {'Authorization': f'Bearer {token}'}

# Test Reset Password
res = requests.post('http://localhost:8000/user/reset-password/51/', headers=headers)
logger.info("RESET_PASSWORD: %s %s", res.status_code, res.text)

# Test Delete
res = requests.delete('http://localhost:8000/user/delete-user/51/', headers=headers)
logger.info("DELETE_USER: %s %s", res.status_code, res.text)

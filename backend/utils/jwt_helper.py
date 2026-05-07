import jwt
from datetime import timedelta
from django.conf import settings
from django.utils import timezone

SECRET_KEY = getattr(settings, 'JWT_SECRET', 'fallback-jwt-key')
ALGORITHM = 'HS256'
EXPIRATION_MINUTES = 60 * 24 # 24 hours

def generate_jwt(user_id):
    payload = {
        'user_id': user_id,
        'exp': timezone.now() + timedelta(minutes=EXPIRATION_MINUTES),
        'iat': timezone.now()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_jwt(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

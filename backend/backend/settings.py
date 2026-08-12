from pathlib import Path
import os
from dotenv import load_dotenv
from django.core.exceptions import ImproperlyConfigured

# Load environment variables
load_dotenv(override=True)

BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = os.getenv('DEBUG', 'False') == 'True'

SECRET_KEY = os.getenv('SECRET_KEY')
JWT_SECRET = os.getenv('JWT_SECRET')

if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = 'dev-only-insecure-secret-key'
    else:
        raise ImproperlyConfigured('SECRET_KEY environment variable is required when DEBUG is False.')

if not JWT_SECRET:
    if DEBUG:
        JWT_SECRET = 'dev-only-insecure-jwt-secret'
    else:
        raise ImproperlyConfigured('JWT_SECRET environment variable is required when DEBUG is False.')

ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'adstradigital.com', 'www.adstradigital.com']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',

    'apis.user',
    'apis.attendance',
    'apis.proposal',
    'apis.invoice',
    'apis.transactions',
    'apis.settings',
    'apis.blogs',
    'apis.leads',
    'apis.chat',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

AUTH_USER_MODEL = 'user.CustomUser'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'utils.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': os.getenv('DRF_ANON_THROTTLE_RATE', '60/minute'),
        'user': os.getenv('DRF_USER_THROTTLE_RATE', '300/minute'),
        'login': os.getenv('DRF_LOGIN_THROTTLE_RATE', '10/minute'),
    },
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

CORS_ALLOWED_ORIGINS = []
_frontend_origins = os.getenv('FRONTEND_ORIGINS', '').strip()
if _frontend_origins:
    CORS_ALLOWED_ORIGINS = [o.strip().rstrip('/') for o in _frontend_origins.split(',') if o.strip()]
else:
    # Default: allow localhost in development, production domain in prod.
    CORS_ALLOWED_ORIGINS = ["https://adstradigital.com"]
    if DEBUG:
        CORS_ALLOWED_ORIGINS.extend([
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:3002",
        ])

APPEND_SLASH = False
# In production, don't allow all origins by default.
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'True' if DEBUG else 'False') == 'True'
CORS_ALLOW_CREDENTIALS = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

SECURE_SSL_REDIRECT = False if DEBUG else os.getenv('SECURE_SSL_REDIRECT', 'True') == 'True'
SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '31536000' if not DEBUG else '0'))
SECURE_HSTS_INCLUDE_SUBDOMAINS = os.getenv('SECURE_HSTS_INCLUDE_SUBDOMAINS', str(not DEBUG)) == 'True'
SECURE_HSTS_PRELOAD = os.getenv('SECURE_HSTS_PRELOAD', str(not DEBUG)) == 'True'
SESSION_COOKIE_SECURE = False if DEBUG else os.getenv('SESSION_COOKIE_SECURE', 'True') == 'True'
CSRF_COOKIE_SECURE = False if DEBUG else os.getenv('CSRF_COOKIE_SECURE', 'True') == 'True'
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# Razorpay Configuration
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET')

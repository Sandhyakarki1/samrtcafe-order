import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ==================================================
# BASIC SETTINGS
# ==================================================
SECRET_KEY = 'django-insecure-l6g6c(axm1g)m3gh0og2&$^szov!)b$w+4p35ajejmeqiksm19'
DEBUG = True

# Allows any tunnel link to connect 
ALLOWED_HOSTS = ['*']


# ==================================================
# INSTALLED APPS
# ==================================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party tools
    'rest_framework',
    'corsheaders',

    #  SmartCafe App
    'admin_panel',
]

# ==================================================
# MIDDLEWARE 
# ==================================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware', 
    'django.contrib.messages.middleware.MessageMiddleware', 
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

# ==================================================
# TEMPLATES (Required for Django Admin to load)
# ==================================================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media', 
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# ==================================================
# DATABASE
# ==================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'smart_cafe.db', 
    }
}

# ==================================================
# CORS & CSRF (CLEANED FOR CLOUDFLARE)
# ==================================================
CORS_ALLOW_ALL_ORIGINS = True 
CORS_ALLOW_CREDENTIALS = True

# Allows any Cloudflare tunnel to send POST requests
CSRF_TRUSTED_ORIGINS = [
    "https://*.trycloudflare.com",
    "https://smart-cafe.vercel.app",
]

# Standard headers 
from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers)

# ==================================================
# DRF SETTINGS
# ==================================================
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny', 
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# ==================================================
# STATIC & MEDIA FILES (For Menu Images)
# ==================================================
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ==================================================
# INTERNATIONALIZATION 
# ==================================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kathmandu'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==================================================
# EMAIL SETTINGS 
# ==================================================
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'admin@smartcafe.com'
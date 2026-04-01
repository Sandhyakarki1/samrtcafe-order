import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# ==================================================
# BASIC SETTINGS
# ==================================================
SECRET_KEY = 'django-insecure-l6g6c(axm1g)m3gh0og2&$^szov!)b$w+4p35ajejmeqiksm19'
DEBUG = True

# Added ngrok domain to allowed hosts
ALLOWED_HOSTS = [
    '*', 
    'nila-irresistible-carmelina.ngrok-free.dev',
    'localhost',
    '127.0.0.1'
]

# Specific Origins for better security
CORS_ALLOWED_ORIGINS = [
    "https://smart-cafe.vercel.app",
    "https://nila-irresistible-carmelina.ngrok-free.dev",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",  
]

# This is required for POST requests (Placing Orders) to work from Vercel/Phones
CSRF_TRUSTED_ORIGINS = [
    "https://smart-cafe.vercel.app",
    "https://nila-irresistible-carmelina.ngrok-free.dev",
]

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

    # SmartCafe App
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
# DRF SETTINGS
# ==================================================
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny', 
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
    ),
}

# ==================================================
# CORS SETTINGS (UPDATED FOR NGROK)
# ==================================================
CORS_ALLOW_ALL_ORIGINS = True 
CORS_ALLOW_CREDENTIALS = True

# This allows the special ngrok-skip header from  React code
from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers) + [
    "ngrok-skip-browser-warning",
]

# ==================================================
# STATIC & MEDIA FILES (For Menu Images)
# ==================================================
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ==================================================
# INTERNATIONALIZATION (NEPAL TIME)
# ==================================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kathmandu'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# ==================================================
# BASIC SETTINGS
# ==================================================
SECRET_KEY = 'django-insecure-l6g6c(axm1g)m3gh0og2&$^szov!)b$w+4p35ajejmeqiksm19'
DEBUG = True
ALLOWED_HOSTS = ['*'] # Allows connection from your Mac browser

# ==================================================
# INSTALLED APPS
# ==================================================
INSTALLED_APPS = [
    # Django Built-in
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party tools
    'rest_framework',
    'corsheaders',

    # Your SmartCafe App
    'admin_panel',
]

# ==================================================
# MIDDLEWARE (Order is critical!)
# ==================================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # ✅ MUST BE FIRST
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
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# ==================================================
# DATABASE (Updated to use your smart_cafe.db)
# ==================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'smart_cafe.db', # ✅ This connects to your 7 orders
    }
}

# ==================================================
# DRF SETTINGS (Allows React to fetch data)
# ==================================================
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny', # ✅ Fixes your fetch error
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# ==================================================
# CORS (Fixes Login and Connection errors)
# ==================================================
CORS_ALLOW_ALL_ORIGINS = True 

# ==================================================
# MEDIA FILES (For Menu Images)
# ==================================================
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ==================================================
# EMAIL SETTINGS (For OTP Feature)
# ==================================================
# This prints the OTP in your VS Code terminal
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'admin@smartcafe.com'

# ==================================================
# INTERNATIONALIZATION
# ==================================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
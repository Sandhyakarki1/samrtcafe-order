from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings 
from django.conf.urls.static import static 

def home(request):
    return HttpResponse("SmartCafe backend is running!")

urlpatterns = [
    path('', home),
    path('djadmin/', admin.site.urls),  # superuser admin panel
    path('api/', include('admin_panel.urls')),  # include all admin_panel API paths
]

# This line allows Django to serve images during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
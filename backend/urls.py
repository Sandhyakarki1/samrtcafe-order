from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings 
from django.conf.urls.static import static 

# Professional Admin Customization
admin.site.site_header = "SmartCafe Dashboard"
admin.site.site_title = "SmartCafe Management"
admin.site.index_title = "System Administration"

# Returns a JSON instead of plain text (Cleaner for APIs)
def home(request):
    return JsonResponse({"status": "Online", "project": "SmartCafe Backend"})

urlpatterns = [
    # Root URL
    path('', home),

    # Main Django Admin (accessible via /djadmin/)
    path('djadmin/', admin.site.urls),  

    # ALL API Routes are prefixed with /api/
    # This means your eSewa link is: /api/esewa/verify/
    path('api/', include('admin_panel.urls')),  
]

# Serve media items (Food Images) during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, 
                          document_root=settings.MEDIA_ROOT)
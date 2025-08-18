from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('user/', include('apis.user.urls')),
    path('attendance/', include('apis.attendance.urls')),
    path('proposal/', include('apis.proposal.urls')),
    path('invoice/', include('apis.invoice.urls')),
    path('transactions/', include('apis.transactions.urls')),

    path("robots.txt", TemplateView.as_view(template_name="robots.txt", content_type="text/plain")),
]


# Serve media files in development and cPanel hosting
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
import os

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse


def health_check(_request):
    return HttpResponse("OK", content_type="text/plain")


def robots_txt(_request):
    return HttpResponse(
        "User-agent: *\nDisallow: /admin/\nDisallow: /user/\nDisallow: /attendance/\n"
        "Disallow: /proposal/\nDisallow: /invoice/\nDisallow: /transactions/\nDisallow: /settings/\n",
        content_type="text/plain",
    )


urlpatterns = [
    path('', health_check, name='health_check'),
    path(os.getenv('DJANGO_ADMIN_PATH', 'admin/'), admin.site.urls),
    path('user/', include('apis.user.urls')),
    path('attendance/', include('apis.attendance.urls')),
    path('proposal/', include('apis.proposal.urls')),
    path('invoice/', include('apis.invoice.urls')),
    path('transactions/', include('apis.transactions.urls')),
    path('settings/', include('apis.settings.urls')),
    path('robots.txt', robots_txt, name='robots_txt'),
]


# Serve media files in development and cPanel hosting
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

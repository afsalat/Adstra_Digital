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
    
    # Standard paths
    path('user/', include('apis.user.urls')),
    path('attendance/', include('apis.attendance.urls')),
    path('proposal/', include('apis.proposal.urls')),
    path('invoice/', include('apis.invoice.urls')),
    path('transactions/', include('apis.transactions.urls')),
    path('settings/', include('apis.settings.urls')),
    path('blogs/', include('apis.blogs.urls')),
    path('leads/', include(('apis.leads.urls', 'leads'), namespace='leads_compat')),
    path('chat/', include('apis.chat.urls')),
    path('social/', include('apis.social.urls')),
    path('', include(('apis.leads.root_urls', 'lead_management_root'), namespace='lead_management_root_compat')),

    # API-prefixed paths for frontend /api compatibility
    path('api/user/', include('apis.user.urls')),
    path('api/attendance/', include('apis.attendance.urls')),
    path('api/proposal/', include('apis.proposal.urls')),
    path('api/invoice/', include('apis.invoice.urls')),
    path('api/transactions/', include('apis.transactions.urls')),
    path('api/settings/', include('apis.settings.urls')),
    path('api/blogs/', include('apis.blogs.urls')),
    path('api/leads/', include(('apis.leads.urls', 'leads'), namespace='leads')),
    path('api/chat/', include('apis.chat.urls')),
    path('api/social/', include('apis.social.urls')),
    path('api/', include(('apis.leads.root_urls', 'lead_management_root'), namespace='lead_management_root')),

    path('robots.txt', robots_txt, name='robots_txt'),
]


def serve_media(request, path, **kwargs):
    from django.views.static import serve as static_serve

    primary_root = settings.MEDIA_ROOT
    if os.path.exists(os.path.join(primary_root, path)):
        return static_serve(request, path, document_root=primary_root, **kwargs)

    frontend_media_root = os.path.join(settings.BASE_DIR.parent, 'adstra-next', 'public', 'media')
    if os.path.exists(os.path.join(frontend_media_root, path)):
        return static_serve(request, path, document_root=frontend_media_root, **kwargs)

    return static_serve(request, path, document_root=primary_root, **kwargs)


# Serve media files in development and cPanel hosting
if settings.DEBUG:
    from django.urls import re_path
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve_media),
    ]

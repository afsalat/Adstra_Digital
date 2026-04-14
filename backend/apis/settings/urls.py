from django.urls import path
from .views import company_settings_view

urlpatterns = [
    path('', company_settings_view, name='company-settings'),
]

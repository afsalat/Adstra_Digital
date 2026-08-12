from django.urls import path
from . import views

urlpatterns = [
    path("employees/", views.employees), path("conversations/", views.conversations),
    path("conversations/<int:conversation_id>/messages/", views.messages),
    path("conversations/<int:conversation_id>/messages/<int:message_id>/", views.message_detail),
    path("conversations/<int:conversation_id>/read/", views.read),
    path("conversations/<int:conversation_id>/typing/", views.typing),
    path("conversations/<int:conversation_id>/members/", views.members), path("presence/", views.heartbeat),
]

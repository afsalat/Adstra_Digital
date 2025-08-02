from django.urls import path
from .views import list_proposals, create_proposal, update_proposal, list_clients, create_client

urlpatterns = [
    path('list/', list_proposals, name='list-proposals'),
    path('create/', create_proposal, name='create-proposal'),
    path('update/<int:pk>/', update_proposal, name='update-proposal'),

    path('clients/', list_clients, name='list_clients'),
    path('clients/create/', create_client, name='create_client'),
]

from django.urls import path
from .views import list_proposals, create_proposal, update_proposal, list_clients, create_client, update_client, delete_client, next_proposal_no, delete_proposal

urlpatterns = [
    path('next-number/', next_proposal_no, name='next_proposal_no'),
    path('list/', list_proposals, name='list-proposals'),
    path('create/', create_proposal, name='create-proposal'),
    path('update/<int:pk>/', update_proposal, name='update-proposal'),
    path('delete/<int:pk>/', delete_proposal, name='delete-proposal'),

    path('clients/', list_clients, name='list_clients'),
    path('clients/create/', create_client, name='create_client'),
    path('clients/update/<int:pk>/', update_client, name='update_client'),
    path('clients/delete/<int:pk>/', delete_client, name='delete_client'),
]

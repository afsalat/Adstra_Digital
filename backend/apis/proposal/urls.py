from django.urls import path
from .views import (
    create_client, create_client_from_lead, create_proposal, delete_client, delete_proposal,
    eligible_leads, list_clients, list_proposals, my_proposals, proposal_requests,
    next_proposal_no, proposal_detail, update_client, update_proposal,
    list_packages, create_package, update_package, delete_package, reset_packages,
)

urlpatterns = [
    path('next-number/', next_proposal_no, name='next_proposal_no'),
    path('list/', list_proposals, name='list-proposals'),
    path('mine/', my_proposals, name='my-proposals'),
    path('eligible-leads/', eligible_leads, name='eligible-leads'),
    path('requests/', proposal_requests, name='proposal-requests'),
    path('detail/<int:pk>/', proposal_detail, name='proposal-detail'),
    path('create/', create_proposal, name='create-proposal'),
    path('update/<int:pk>/', update_proposal, name='update-proposal'),
    path('delete/<int:pk>/', delete_proposal, name='delete-proposal'),

    path('clients/', list_clients, name='list_clients'),
    path('clients/create/', create_client, name='create_client'),
    path('clients/from-lead/<int:lead_id>/', create_client_from_lead, name='create-client-from-lead'),
    path('clients/update/<int:pk>/', update_client, name='update_client'),
    path('clients/delete/<int:pk>/', delete_client, name='delete_client'),

    # Dynamic Service Packages
    path('packages/', list_packages, name='list-packages'),
    path('packages/create/', create_package, name='create-package'),
    path('packages/update/<int:pk>/', update_package, name='update-package'),
    path('packages/delete/<int:pk>/', delete_package, name='delete-package'),
    path('packages/reset/', reset_packages, name='reset-packages'),
]

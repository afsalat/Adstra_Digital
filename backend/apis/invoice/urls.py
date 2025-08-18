from django.urls import path
from .views import generate_invoice_from_proposal,invoice_list, get_proposals_for_client, list_invoices, create_invoice, update_invoice, view_invoice_detail

urlpatterns = [
    path('', list_invoices, name='list-invoices'),
    path('create/', create_invoice, name='create-invoice'),
    path('update/<int:pk>/', update_invoice, name='update-invoice'),
    path('latests/<int:client_id>/', get_proposals_for_client, name='get_proposals_for_client'),
    path('invoice_list/<int:client_id>/', invoice_list, name='invoice_list'),
    path('generate/<int:proposal_id>/', generate_invoice_from_proposal),
    path('view/<str:invoiceID>/', view_invoice_detail, name='view_invoice_by_number'),
]

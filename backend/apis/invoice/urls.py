from django.urls import path, re_path
from .views import (
    generate_invoice_from_proposal, invoice_list, get_proposals_for_client,
    list_invoices, create_invoice, update_invoice, view_invoice_detail,
    update_invoice_status, delete_invoice, list_trash, restore_invoice,
    get_next_invoice_number,
)

urlpatterns = [
    path('next-number/', get_next_invoice_number, name='next-invoice-number'),
    path('', list_invoices, name='list-invoices'),
    path('create/', create_invoice, name='create-invoice'),
    path('update/<int:pk>/', update_invoice, name='update-invoice'),
    path('status/<int:pk>/', update_invoice_status, name='update-invoice-status'),
    path('delete/<int:pk>/', delete_invoice, name='delete-invoice'),
    path('trash/', list_trash, name='list-trash'),
    path('restore/<int:pk>/', restore_invoice, name='restore-invoice'),
    path('latests/<int:client_id>/', get_proposals_for_client, name='get_proposals_for_client'),
    path('invoice_list/<int:client_id>/', invoice_list, name='invoice_list'),
    path('generate/<int:proposal_id>/', generate_invoice_from_proposal),
    re_path(r'^view/(?P<invoiceID>[^/]+)/*$', view_invoice_detail, name='view_invoice_by_number'),
]

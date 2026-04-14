from django.urls import path
from .views import (
    transaction_list_create, 
    transaction_detail, 
    transaction_trash_list, 
    transaction_delete, 
    transaction_restore
)

urlpatterns = [
    path('list-create/', transaction_list_create, name='transaction-list-create'),
    path('details/<int:pk>/', transaction_detail, name='transaction-detail'),
    path('trash/', transaction_trash_list, name='transaction-trash-list'),
    path('delete/<int:pk>/', transaction_delete, name='transaction-delete'),
    path('restore/<int:pk>/', transaction_restore, name='transaction-restore'),
]
    
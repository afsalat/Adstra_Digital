from django.urls import path
from .views import transaction_list_create, transaction_detail

urlpatterns = [
    path('list-create/', transaction_list_create, name='transaction-list-create'),
    path('details/<int:pk>/', transaction_detail, name='transaction-detail'),
]
    
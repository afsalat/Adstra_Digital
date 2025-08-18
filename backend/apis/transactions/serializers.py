from apis.invoice.serializers import ViewInvoiceSerializer
from apis.transactions.models import Transaction
from rest_framework import serializers


class TransactionSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    invoice = ViewInvoiceSerializer(read_only=True)
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'invoice', 'client', 'client_name',
            'date', 'amount', 'balance_amount',
            'purpose', 'payment_mode', 'reference_no',
            'user', 'user_name', 'notes',
        ]
        read_only_fields = ['id', 'date', 'user']
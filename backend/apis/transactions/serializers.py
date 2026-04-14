from apis.invoice.serializers import ViewInvoiceSerializer
from apis.invoice.models import Invoice
from apis.transactions.models import Transaction
from apis.proposal.serializers import ClientSerializer
from rest_framework import serializers


class TransactionSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    # Writable ID field, we'll override to_representation for details
    invoice = serializers.PrimaryKeyRelatedField(
        queryset=Invoice.objects.all(), required=False, allow_null=True
    )
    user_name = serializers.CharField(source="user.username", read_only=True)
    
    # Map frontend camelCase to backend snake_case
    balanceAmount = serializers.DecimalField(
        source='balance_amount', max_digits=12, decimal_places=2, write_only=True, required=False
    )

    class Meta:
        model = Transaction
        fields = [
            'id', 'invoice', 'client', 'client_name',
            'date', 'amount', 'balance_amount', 'balanceAmount',
            'purpose', 'payment_mode', 'reference_no',
            'user', 'user_name', 'notes',
        ]
        read_only_fields = ['id', 'date', 'user', 'balance_amount']

    def to_representation(self, instance):
        # Return full nested objects on read
        representation = super().to_representation(instance)
        if instance.invoice:
            representation['invoice'] = ViewInvoiceSerializer(instance.invoice).data
        if instance.client:
            representation['client'] = ClientSerializer(instance.client).data
        return representation
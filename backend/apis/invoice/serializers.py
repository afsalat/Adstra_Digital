from rest_framework import serializers
from apis.proposal.models import Proposal, ProposalService
from .models import Invoice, InvoiceItem, InvoiceAdditionalCharge
from apis.proposal.serializers import ClientSerializer, ProposalSerializer

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        exclude = ['invoice']
        extra_kwargs = {
            'amount': {'read_only': True}
        }

class InvoiceAdditionalChargeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceAdditionalCharge
        exclude = ['invoice']

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    additional_charges = InvoiceAdditionalChargeSerializer(many=True, required=False)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_no', 'proposal', 'client', 'date', 'due_date',
            'total_amount', 'balance_due', 'total_in_words', 'reference', 'notes',
            'status', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature',
            'paid_at', 'is_deleted', 'discount_amount', 'discount_label', 'additional_fee',
            'tax_amount', 'advance_amount', 'is_proforma', 'created_by', 'items', 'additional_charges'
        ]
        extra_kwargs = {
            'discount_amount': {'required': False},
            'additional_fee': {'required': False},
            'tax_amount': {'required': False},
            'advance_amount': {'required': False},
            'balance_due': {'read_only': True},
        }

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        additional_charges_data = validated_data.pop('additional_charges', [])
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        for charge_data in additional_charges_data:
            InvoiceAdditionalCharge.objects.create(invoice=invoice, **charge_data)
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items')
        additional_charges_data = validated_data.pop('additional_charges', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Clear and recreate items
        instance.items.all().delete()
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=instance, **item_data)
        
        # Clear and recreate additional charges
        instance.additional_charges.all().delete()
        for charge_data in additional_charges_data:
            InvoiceAdditionalCharge.objects.create(invoice=instance, **charge_data)

        return instance
    
class ViewInvoiceSerializer(serializers.ModelSerializer):
    client = ClientSerializer()
    proposal = ProposalSerializer()
    items = InvoiceItemSerializer(many=True)  # Use the related_name='items'
    additional_charges = InvoiceAdditionalChargeSerializer(many=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_no', 'proposal', 'client', 'date', 'due_date',
            'total_amount', 'balance_due', 'total_in_words', 'reference', 'notes',
            'status', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature',
            'paid_at', 'is_deleted', 'discount_amount', 'discount_label', 'additional_fee',
            'tax_amount', 'advance_amount', 'is_proforma', 'created_by', 'items', 'additional_charges'
        ]
        read_only_fields = ['balance_due']



class CreateInvoiceFromProposalSerializer(serializers.Serializer):
    proposal_id = serializers.IntegerField()
    is_proforma = serializers.BooleanField(required=False, default=False)

    def validate_proposal_id(self, value):
        try:
            Proposal.objects.get(id=value)
        except Proposal.DoesNotExist:
            raise serializers.ValidationError("Proposal not found.")
        return value

    def create(self, validated_data):
        proposal = Proposal.objects.get(id=validated_data['proposal_id'])

        invoice = Invoice.objects.create(
            invoice_no=Invoice.generate_invoice_number(is_proforma=validated_data.get('is_proforma', False)),
            is_proforma=validated_data.get('is_proforma', False),
            proposal=proposal,
            client=proposal.client,
            total_amount=proposal.total_amount,
            total_in_words=proposal.total_in_words,
            notes=proposal.notes,
            created_by=proposal.created_by
        )

        services = ProposalService.objects.filter(proposal=proposal)
        for service in services:
            InvoiceItem.objects.create(
                invoice=invoice,
                description=service.description,
                quantity=service.quantity,
                rate=service.rate,
                gst=service.gst,
            )

        return invoice

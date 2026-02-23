from rest_framework import serializers
from apis.proposal.models import Proposal, ProposalService
from .models import Invoice, InvoiceItem
from apis.proposal.serializers import ClientSerializer, ProposalSerializer

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        exclude = ['invoice']

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)

    class Meta:
        model = Invoice
        fields = '__all__'

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items')
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Clear and recreate items
        instance.items.all().delete()
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=instance, **item_data)

        return instance
    
class ViewInvoiceSerializer(serializers.ModelSerializer):
    client = ClientSerializer()
    proposal = ProposalSerializer()
    items = InvoiceItemSerializer(many=True)  # Use the related_name='items'

    class Meta:
        model = Invoice
        fields = '__all__'



class CreateInvoiceFromProposalSerializer(serializers.Serializer):
    proposal_id = serializers.IntegerField()

    def validate_proposal_id(self, value):
        try:
            Proposal.objects.get(id=value)
        except Proposal.DoesNotExist:
            raise serializers.ValidationError("Proposal not found.")
        return value

    def create(self, validated_data):
        proposal = Proposal.objects.get(id=validated_data['proposal_id'])

        invoice = Invoice.objects.create(
            invoice_no=Invoice.generate_invoice_number(),
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


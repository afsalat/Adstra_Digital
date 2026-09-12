from rest_framework import serializers
from .models import Proposal, ProposalRequest, ProposalService, ProposalSection, Client

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

class ProposalServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposalService
        fields = '__all__'
        extra_kwargs = {'proposal': {'read_only': True}}

class ProposalSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposalSection
        fields = '__all__'
        extra_kwargs = {'proposal': {'read_only': True}}


class ProposalRequestSerializer(serializers.ModelSerializer):
    lead_number = serializers.CharField(source='lead.lead_number', read_only=True)
    lead_name = serializers.SerializerMethodField()
    requested_by_name = serializers.CharField(source='requested_by.fullname', read_only=True)
    proposal = serializers.SerializerMethodField()

    class Meta:
        model = ProposalRequest
        fields = '__all__'
        read_only_fields = ('lead', 'requested_by', 'status', 'created_at', 'updated_at')

    def get_lead_name(self, obj):
        return obj.lead.company_name or obj.lead.customer_name or obj.lead.contact_person or obj.lead.lead_number

    def get_proposal(self, obj):
        proposal = obj.lead.quotation
        return {'id': proposal.id, 'proposal_no': proposal.proposal_no} if proposal else None

class ProposalSerializer(serializers.ModelSerializer):
    services = ProposalServiceSerializer(many=True, required=False)
    sections = ProposalSectionSerializer(many=True, required=False)
    source_lead = serializers.SerializerMethodField()
    
    # Read: Return full client object
    client = ClientSerializer(read_only=True)
    # Write: Accept client ID
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(), source='client', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Proposal
        fields = '__all__'
        read_only_fields = ('created_by',)

    def get_source_lead(self, obj):
        lead = next(iter(obj.source_leads.all()), None)
        if lead is None:
            return None
        return {
            'id': lead.id,
            'lead_number': lead.lead_number,
            'company_name': lead.company_name,
            'customer_name': lead.customer_name,
            'contact_person': lead.contact_person,
            'product': lead.product,
            'service': lead.service,
            'current_stage': lead.current_stage,
            'assigned_to_name': lead.assigned_to.fullname if lead.assigned_to else '',
        }

    def create(self, validated_data):
        services_data = validated_data.pop('services', [])
        sections_data = validated_data.pop('sections', [])
        proposal = Proposal.objects.create(**validated_data)

        for service_data in services_data:
            ProposalService.objects.create(proposal=proposal, **service_data)

        for section_data in sections_data:
            ProposalSection.objects.create(proposal=proposal, **section_data)

        return proposal

    def update(self, instance, validated_data):
        services_data = validated_data.pop('services', None)
        sections_data = validated_data.pop('sections', None)

        # Update standard fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Services
        if services_data is not None:
            instance.services.all().delete() # Simple replacement strategy
            for service_data in services_data:
                ProposalService.objects.create(proposal=instance, **service_data)

        # Update Sections
        if sections_data is not None:
            instance.sections.all().delete() # Simple replacement strategy
            for section_data in sections_data:
                ProposalSection.objects.create(proposal=instance, **section_data)

        return instance

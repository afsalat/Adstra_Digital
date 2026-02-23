from rest_framework import serializers
from .models import Proposal, ProposalService, ProposalSection, Client

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

class ProposalSerializer(serializers.ModelSerializer):
    services = ProposalServiceSerializer(many=True, required=False)
    sections = ProposalSectionSerializer(many=True, required=False)
    
    # Read: Return full client object
    client = ClientSerializer(read_only=True)
    # Write: Accept client ID
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(), source='client', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Proposal
        fields = '__all__'

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

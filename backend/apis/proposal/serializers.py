from decimal import Decimal
from apis.user.models import CustomUser
from rest_framework import serializers
from .models import Proposal, ProposalService, ProposalSection, Client



class ProposalServiceSerializer(serializers.ModelSerializer):
    gst = serializers.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=Decimal('0.00'),
        required=False
    )

    class Meta:
        model = ProposalService
        fields = '__all__'


class ProposalSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposalSection
        fields = '__all__'

class ProposalSerializer(serializers.ModelSerializer):
    services = ProposalServiceSerializer(many=True)
    sections = ProposalSectionSerializer(many=True)

    class Meta:
        model = Proposal
        fields = '__all__'

    def create(self, validated_data):

        services_data = validated_data.pop('services', [])
        sections_data = validated_data.pop('sections', [])
        id = validated_data.pop('created_by', 0)
        user = CustomUser.objects.get(id=27)

        proposal = Proposal.objects.create(created_by=user, **validated_data)

        for service in services_data:
            ProposalService.objects.create(proposal=proposal, **service)

        for section in sections_data:
            ProposalSection.objects.create(proposal=proposal, **section)

        return proposal



class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Client, Proposal
from .serializers import ClientSerializer, ProposalSerializer
import logging




@api_view(['GET'])
@permission_classes([AllowAny])
def list_clients(request):
    clients = Client.objects.all()
    serializer = ClientSerializer(clients, many=True)
    return Response(serializer.data)



@api_view(['POST'])
@permission_classes([AllowAny])
def create_client(request):
    serializer = ClientSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_proposals(request):
    try:
        proposals = Proposal.objects.all().order_by('-created_at')
        serializer = ProposalSerializer(proposals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_proposal(request):
    try:
        serializer = ProposalSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            proposal = serializer.save()
            return Response({"message": "Proposal created", "id": proposal.id}, status=status.HTTP_201_CREATED)
        else:
            logger.error("Proposal validation failed: %s", serializer.errors)
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception("Unexpected error in create_proposal")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_proposal(request, pk):
    try:
        proposal = Proposal.objects.get(pk=pk)
        serializer = ProposalSerializer(proposal, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Proposal.DoesNotExist:
        return Response({'error': 'Proposal not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
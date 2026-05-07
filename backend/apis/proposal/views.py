from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Client, Proposal
from .serializers import ClientSerializer, ProposalSerializer
from utils.permissions import require_permission
import logging
from datetime import date


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def next_proposal_no(request):
    denial = require_permission(request, "proposals.create")
    if denial:
        return denial
    """Return the next available proposal number as AD/YYYY/NNNN (guaranteed unique)."""
    year = date.today().year
    prefix = f"AD/{year}/"
    # Collect all existing sequence numbers for this year
    existing_nos = set(
        Proposal.objects.filter(proposal_no__startswith=prefix)
        .values_list('proposal_no', flat=True)
    )
    existing_seqs = set()
    for pno in existing_nos:
        try:
            existing_seqs.add(int(pno.split('/')[-1]))
        except (ValueError, IndexError):
            pass
    # Find max and walk forward until we find an unused number
    candidate = (max(existing_seqs) + 1) if existing_seqs else 1001
    while candidate in existing_seqs:
        candidate += 1
    return Response({"proposal_no": f"{prefix}{candidate:04d}"})




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_clients(request):
    denial = require_permission(request, "clients.view")
    if denial:
        return denial
    clients = Client.objects.all()
    serializer = ClientSerializer(clients, many=True)
    return Response(serializer.data)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_client(request):
    denial = require_permission(request, "clients.create")
    if denial:
        return denial
    serializer = ClientSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_proposals(request):
    denial = require_permission(request, "proposals.view")
    if denial:
        return denial
    try:
        proposals = Proposal.objects.all().order_by('-id')
        serializer = ProposalSerializer(proposals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception:
        logger.exception("Unable to list proposals")
        return Response({'error': 'Unable to list proposals.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_proposal(request, clientID):
#     try:
#         proposal = Proposal.objects.get(Client=clientID)

#         if

#         serializer = ProposalSerializer(proposal, many=True)
#         return Response(serializer.data)
#     except Exception as e:
#         return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_proposal(request):
    denial = require_permission(request, "proposals.create")
    if denial:
        return denial
    try:
        serializer = ProposalSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            proposal = serializer.save()
            return Response({"message": "Proposal created", "id": proposal.id}, status=status.HTTP_201_CREATED)
        else:
            logger.error("Proposal validation failed: %s", serializer.errors)
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        logger.exception("Unexpected error in create_proposal")
        return Response({"error": "Unable to create proposal."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_proposal(request, pk):
    denial = require_permission(request, "proposals.update")
    if denial:
        return denial
    try:
        proposal = Proposal.objects.get(pk=pk)
        serializer = ProposalSerializer(proposal, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Proposal.DoesNotExist:
        return Response({'error': 'Proposal not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception:
        logger.exception(f"Unable to update proposal {pk}")
        return Response({'error': 'Unable to update proposal.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_client(request, pk):
    denial = require_permission(request, "clients.update")
    if denial:
        return denial
    try:
        client = Client.objects.get(pk=pk)
        serializer = ClientSerializer(client, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Client.DoesNotExist:
        return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception:
        logger.exception(f"Unable to update client {pk}")
        return Response({'error': 'Unable to update client.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_client(request, pk):
    denial = require_permission(request, "clients.delete")
    if denial:
        return denial
    try:
        from django.db import transaction
        from apis.invoice.models import Invoice
        from apis.transactions.models import Transaction
        
        with transaction.atomic():
            client = Client.objects.get(pk=pk)
            
            # Manually delete related objects in correct order to avoid FK constraints
            
            # 0. Delete from ghost table 'invoice_receipt' if it exists (DB Integrity Fix)
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM invoice_receipt WHERE client_id = %s", [client.id])

            # 1. Transactions (depend on Invoice & Client)
            Transaction.objects.filter(client=client).delete()
            
            # 2. Invoices (depend on Proposal & Client)
            # Note: Invoices might be linked to proposals, so we delete them before proposals
            Invoice.objects.filter(client=client).delete()
            
            # 3. Proposals (depend on Client)
            Proposal.objects.filter(client=client).delete()
            
            # 4. Finally delete the client
            client.delete()
            
        return Response({'message': 'Client deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Client.DoesNotExist:
        return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception:
        logger.exception(f"Error deleting client {pk}")
        return Response({'error': 'Unable to delete client.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_proposal(request, pk):
    denial = require_permission(request, "proposals.delete")
    if denial:
        return denial
    try:
        proposal = Proposal.objects.get(pk=pk)
        proposal.delete()
        return Response({'message': 'Proposal deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Proposal.DoesNotExist:
        return Response({'error': 'Proposal not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception:
        logger.exception(f"Unable to delete proposal {pk}")
        return Response({'error': 'Unable to delete proposal.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

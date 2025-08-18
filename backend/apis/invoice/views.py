# views.py
from apis.proposal.serializers import ProposalSerializer
from apis.proposal.models import Proposal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import Invoice, create_invoice_from_proposal
from .serializers import InvoiceSerializer, ViewInvoiceSerializer
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def list_invoices(request):
    invoices = Invoice.objects.all()
    serializer = ViewInvoiceSerializer(invoices, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_invoice(request):
    serializer = InvoiceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_invoice(request, pk):
    try:
        invoice = Invoice.objects.get(pk=pk)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = InvoiceSerializer(invoice, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([AllowAny])
def get_proposals_for_client(request, client_id):
    proposals = Proposal.objects.select_related('client').filter(client_id=client_id).all()

    print(" ---- ", proposals)

    if not proposals.exists():
        return Response({'detail': 'No proposals found for this client.'}, status=404)

    serializer = ProposalSerializer(proposals, many=True)
    return Response(serializer.data)



@api_view(['POST'])
@permission_classes([AllowAny])
def generate_invoice_from_proposal(request, proposal_id):
    try:
        proposal = Proposal.objects.get(pk=proposal_id)
        invoice = create_invoice_from_proposal(proposal)
        return Response({
            "message": "Invoice created successfully",
            "invoice_no": invoice.invoice_no,
            "invoice_id": invoice.id
        })
    except Proposal.DoesNotExist:
        return Response({"error": "Proposal not found."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    

@api_view(['GET'])
@permission_classes([AllowAny])
def view_invoice_detail(request, invoiceID):
    try:
        print(" --- ", invoiceID)
        invoice = Invoice.objects.get(invoice_no__iexact=invoiceID)
        print("---", invoice)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=404)

    serializer = ViewInvoiceSerializer(invoice)
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([AllowAny])
def invoice_list(request, client_id):
    # client_id = request.GET.get('client_id')
    qs = Invoice.objects.all()
    if client_id:
        qs = qs.filter(client=client_id)
    serializer = InvoiceSerializer(qs, many=True)
    return Response(serializer.data)



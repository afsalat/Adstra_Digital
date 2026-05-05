# views.py
from apis.proposal.serializers import ProposalSerializer
from apis.proposal.models import Proposal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import Invoice, create_invoice_from_proposal
from .serializers import InvoiceSerializer, ViewInvoiceSerializer
from rest_framework.permissions import AllowAny

from django.views.decorators.cache import never_cache

@api_view(['GET'])
@permission_classes([AllowAny])
@never_cache
def list_invoices(request):
    is_proforma = request.query_params.get('is_proforma')
    invoices = Invoice.objects.filter(is_deleted=False).order_by('-id')
    
    if is_proforma is not None:
        is_proforma_bool = is_proforma.lower() == 'true'
        invoices = invoices.filter(is_proforma=is_proforma_bool)
        
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


@api_view(['PATCH'])
@permission_classes([AllowAny])
def update_invoice_status(request, pk):
    """Update only the status field of an invoice."""
    try:
        invoice = Invoice.objects.get(pk=pk)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    valid_statuses = ['unpaid', 'partially_paid', 'paid', 'cancelled']
    if new_status not in valid_statuses:
        return Response(
            {'error': f'Invalid status. Must be one of: {valid_statuses}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    invoice.status = new_status
    invoice.save(update_fields=['status'])
    return Response({'id': invoice.id, 'status': invoice.status})


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_invoice(request, pk):
    """Soft-delete (move to trash) an invoice."""
    try:
        invoice = Invoice.objects.get(pk=pk)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)
    invoice.is_deleted = True
    invoice.save(update_fields=['is_deleted'])
    return Response({'message': 'Invoice moved to trash'}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def hard_delete_invoice(request, pk):
    """Permanently delete an invoice."""
    try:
        invoice = Invoice.objects.get(pk=pk)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)
    invoice.delete()
    return Response({'message': 'Invoice permanently deleted'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
@never_cache
def list_trash(request):
    """List all soft-deleted (trashed) invoices."""
    print("DEBUG: list_trash called")
    invoices = Invoice.objects.filter(is_deleted=True)
    print(f"DEBUG: Found {invoices.count()} deleted invoices")
    serializer = ViewInvoiceSerializer(invoices, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([AllowAny])
def restore_invoice(request, pk):
    """Restore a soft-deleted invoice back to the active list."""
    try:
        invoice = Invoice.objects.get(pk=pk, is_deleted=True)
    except Invoice.DoesNotExist:
        return Response({'error': 'Trashed invoice not found'}, status=status.HTTP_404_NOT_FOUND)
    invoice.is_deleted = False
    invoice.save(update_fields=['is_deleted'])
    return Response({'message': 'Invoice restored'})


@api_view(['GET'])
@permission_classes([AllowAny])
def get_proposals_for_client(request, client_id):
    proposals = Proposal.objects.select_related('client').filter(client_id=client_id).all()

    if not proposals.exists():
        return Response([])

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
@never_cache
def view_invoice_detail(request, invoiceID):
    try:
        invoiceID = invoiceID.strip('/')
        print(f"DEBUG: view_invoice_detail called for ID: {invoiceID}")
        invoice = Invoice.objects.get(invoice_no__iexact=invoiceID)
        print(f"DEBUG: Found invoice: {invoice.invoice_no}, Status: {invoice.status}")
        print("---", invoice)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=404)

    serializer = ViewInvoiceSerializer(invoice)
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([AllowAny])
@never_cache
def invoice_list(request, client_id):
    # client_id = request.GET.get('client_id')
    qs = Invoice.objects.all()
    if client_id:
        qs = qs.filter(client=client_id)
    serializer = InvoiceSerializer(qs, many=True)
    return Response(serializer.data)

# ========== RAZORPAY PAYMENT INTEGRATION ==========
import hmac
import hashlib
from django.conf import settings as django_settings
from django.utils import timezone

# Lazy load razorpay client to avoid import errors if package not installed
_razorpay_client = None

def get_razorpay_client():
    """Lazily initialize and return the Razorpay client"""
    global _razorpay_client
    if _razorpay_client is None:
        try:
            import razorpay
            _razorpay_client = razorpay.Client(
                auth=(django_settings.RAZORPAY_KEY_ID, django_settings.RAZORPAY_KEY_SECRET)
            )
        except ImportError:
            raise ImportError("razorpay package not installed. Run: pip install razorpay")
    return _razorpay_client

@api_view(['POST'])
@permission_classes([AllowAny])
def create_razorpay_order(request, invoice_id):
    """Create a Razorpay order for the given invoice"""
    try:
        invoice = Invoice.objects.get(pk=invoice_id)
        
        if invoice.status == 'paid':
            return Response({'error': 'Invoice is already paid'}, status=400)
        
        # Amount in paise (Razorpay expects amount in smallest currency unit)
        amount_in_paise = int(float(invoice.total_amount) * 100)
        
        # Create Razorpay order
        order_data = {
            'amount': amount_in_paise,
            'currency': 'INR',
            'receipt': f'invoice_{invoice.invoice_no}',
            'notes': {
                'invoice_id': str(invoice.id),
                'invoice_no': invoice.invoice_no,
                'client_name': invoice.client.name if invoice.client else 'N/A'
            }
        }
        
        razorpay_order = get_razorpay_client().order.create(data=order_data)
        
        # Save order ID to invoice
        invoice.razorpay_order_id = razorpay_order['id']
        invoice.save()
        
        return Response({
            'order_id': razorpay_order['id'],
            'amount': amount_in_paise,
            'currency': 'INR',
            'key_id': django_settings.RAZORPAY_KEY_ID,
            'invoice_no': invoice.invoice_no,
            'client_name': invoice.client.name if invoice.client else 'N/A',
            'client_email': invoice.client.email if invoice.client and hasattr(invoice.client, 'email') else '',
            'client_phone': invoice.client.phone if invoice.client and hasattr(invoice.client, 'phone') else '',
        })
        
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_razorpay_payment(request):
    """Verify the Razorpay payment signature and update invoice status"""
    try:
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response({'error': 'Missing payment details'}, status=400)
        
        # Verify signature
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        expected_signature = hmac.new(
            django_settings.RAZORPAY_KEY_SECRET.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if expected_signature != razorpay_signature:
            return Response({'error': 'Invalid payment signature'}, status=400)
        
        # Find and update invoice
        try:
            invoice = Invoice.objects.get(razorpay_order_id=razorpay_order_id)
            invoice.razorpay_payment_id = razorpay_payment_id
            invoice.razorpay_signature = razorpay_signature
            invoice.status = 'paid'
            invoice.paid_at = timezone.now()
            invoice.save()
            
            return Response({
                'success': True,
                'message': 'Payment verified successfully',
                'invoice_no': invoice.invoice_no,
                'status': 'paid'
            })
            
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found for this order'}, status=404)
            
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_payment_status(request, invoice_id):
    """Get payment status for an invoice"""
    try:
        invoice = Invoice.objects.get(pk=invoice_id)
        return Response({
            'invoice_no': invoice.invoice_no,
            'status': invoice.status,
            'paid_at': invoice.paid_at,
            'razorpay_payment_id': invoice.razorpay_payment_id,
        })
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=404)


@api_view(['GET'])
@permission_classes([AllowAny])
@never_cache
def get_next_invoice_number(request):
    """Generate and return the next invoice number."""
    is_proforma = request.GET.get('is_proforma', 'false').lower() == 'true'
    next_num = Invoice.generate_invoice_number(is_proforma=is_proforma)
    return Response({'next_invoice_number': next_num})

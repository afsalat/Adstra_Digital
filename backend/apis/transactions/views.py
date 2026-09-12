from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apis.transactions.serializers import TransactionSerializer
from apis.transactions.models import Transaction
from django.views.decorators.cache import never_cache
from utils.permissions import has_permission, permission_denied

# Create your views here.
HAS_TRANSACTION_TYPE = any(field.name == "transaction_type" for field in Transaction._meta.fields)


def _is_receipt(transaction_or_data):
    if not HAS_TRANSACTION_TYPE:
        return True
    if hasattr(transaction_or_data, "transaction_type"):
        return transaction_or_data.transaction_type == "receipt"
    return str(transaction_or_data.get("transaction_type", "receipt")).lower() == "receipt"


def _permission_code(action, is_receipt=False):
    return f"{'receipts' if is_receipt else 'transactions'}.{action}"


def _require_transaction_permission(request, action, is_receipt=False):
    code = _permission_code(action, is_receipt)
    if has_permission(request.user, code):
        return None
    return permission_denied(code)


def _filter_transactions_for_user(user, queryset):
    transaction_allowed = has_permission(user, "transactions.view")
    receipt_allowed = has_permission(user, "receipts.view")
    if not HAS_TRANSACTION_TYPE:
        if receipt_allowed:
            return queryset, None
        return queryset.none(), permission_denied("receipts.view")
    if transaction_allowed and receipt_allowed:
        return queryset, None
    if transaction_allowed:
        return queryset.exclude(transaction_type="receipt"), None
    if receipt_allowed:
        return queryset.filter(transaction_type="receipt"), None
    return queryset.none(), permission_denied("transactions.view")


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@never_cache
def transaction_list_create(request):
    if request.method == 'GET':
        transactions, denial = _filter_transactions_for_user(
            request.user,
            Transaction.objects.filter(is_deleted=False).order_by('-id'),
        )
        if denial:
            return denial
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data.copy()
        denial = _require_transaction_permission(request, "create", _is_receipt(data))
        if denial:
            return denial
        # Fallback to anonymous if not authenticated for simple dev
        data['user'] = request.user.id if request.user.is_authenticated else None
        serializer = TransactionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@never_cache
def transaction_detail(request, pk):
    try:
        transaction = Transaction.objects.get(pk=pk)
    except Transaction.DoesNotExist:
        return Response({'detail': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)
    denial = _require_transaction_permission(request, "view", _is_receipt(transaction))
    if denial:
        return denial

    serializer = TransactionSerializer(transaction)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@never_cache
def transaction_trash_list(request):
    transactions, denial = _filter_transactions_for_user(
        request.user,
        Transaction.objects.filter(is_deleted=True).order_by('-id'),
    )
    if denial:
        return denial
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def transaction_delete(request, pk):
    try:
        transaction = Transaction.objects.get(pk=pk)
        denial = _require_transaction_permission(request, "delete", _is_receipt(transaction))
        if denial:
            return denial
        transaction.is_deleted = True
        transaction.save()
        return Response({'message': 'Moved to trash'}, status=status.HTTP_200_OK)
    except Transaction.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def transaction_restore(request, pk):
    try:
        transaction = Transaction.objects.get(pk=pk)
        denial = _require_transaction_permission(request, "restore", _is_receipt(transaction))
        if denial:
            return denial
        transaction.is_deleted = False
        transaction.save()
        return Response({'message': 'Restored'}, status=status.HTTP_200_OK)
    except Transaction.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

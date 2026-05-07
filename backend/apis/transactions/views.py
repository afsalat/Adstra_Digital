from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apis.transactions.serializers import TransactionSerializer
from apis.transactions.models import Transaction
from django.views.decorators.cache import never_cache
from utils.permissions import require_permission

# Create your views here.
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@never_cache
def transaction_list_create(request):
    if request.method == 'GET':
        denial = require_permission(request, "transactions.view")
        if denial:
            return denial
        transactions = Transaction.objects.filter(is_deleted=False).order_by('-id')
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        denial = require_permission(request, "transactions.create")
        if denial:
            return denial
        data = request.data.copy()
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
    denial = require_permission(request, "transactions.view")
    if denial:
        return denial
    try:
        transaction = Transaction.objects.get(pk=pk)
    except Transaction.DoesNotExist:
        return Response({'detail': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = TransactionSerializer(transaction)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@never_cache
def transaction_trash_list(request):
    denial = require_permission(request, "transactions.view")
    if denial:
        return denial
    transactions = Transaction.objects.filter(is_deleted=True).order_by('-id')
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def transaction_delete(request, pk):
    denial = require_permission(request, "transactions.delete")
    if denial:
        return denial
    try:
        transaction = Transaction.objects.get(pk=pk)
        transaction.is_deleted = True
        transaction.save()
        return Response({'message': 'Moved to trash'}, status=status.HTTP_200_OK)
    except Transaction.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def transaction_restore(request, pk):
    denial = require_permission(request, "transactions.restore")
    if denial:
        return denial
    try:
        transaction = Transaction.objects.get(pk=pk)
        transaction.is_deleted = False
        transaction.save()
        return Response({'message': 'Restored'}, status=status.HTTP_200_OK)
    except Transaction.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

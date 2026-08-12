import json
import logging
from django.core import serializers
from django.http import HttpResponse
from django.apps import apps
from django.db import transaction as db_transaction
from django.views.decorators.cache import never_cache
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, JSONParser
from .models import CompanySettings, AuditLog
from .serializers import CompanySettingsSerializer, AuditLogSerializer
from utils.permissions import require_permission

logger = logging.getLogger(__name__)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
@never_cache
def company_settings_view(request):
    settings_obj = CompanySettings.objects.first()
    
    if not settings_obj:
        # Create default settings if none exist
        settings_obj = CompanySettings.objects.create()

    if request.method == 'GET':
        denial = require_permission(request, "settings.view")
        if denial:
            return denial
        serializer = CompanySettingsSerializer(settings_obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        denial = require_permission(request, "settings.update")
        if denial:
            return denial
        
        logger.debug(f"Received settings update: {request.data}")
        serializer = CompanySettingsSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            from utils.logging_helper import log_action
            log_action(request.user, "Settings Updated", "Updated company settings", request)
            logger.info("Settings saved successfully")
            return Response(serializer.data)
        logger.warning(f"Settings serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_backup(request):
    denial = require_permission(request, "backup.export")
    if denial:
        return denial
    table = request.query_params.get('table', 'full')
    
    mapping = {
        'users': [('user', 'CustomUser')],
        'settings': [('apis.settings', 'CompanySettings')],
        'clients': [('apis.proposal', 'Client')],
        'proposals': [
            ('apis.proposal', 'Proposal'),
            ('apis.proposal', 'ProposalSection'),
            ('apis.proposal', 'ProposalService')
        ],
        'invoices': [
            ('apis.invoice', 'Invoice'),
            ('apis.invoice', 'InvoiceItem'),
            ('apis.invoice', 'InvoiceAdditionalCharge')
        ],
        'performa': [
            ('apis.invoice', 'Invoice'),
            ('apis.invoice', 'InvoiceItem'),
            ('apis.invoice', 'InvoiceAdditionalCharge')
        ],
        'receipts': [('apis.transactions', 'Transaction')],
        'attendance': [
            ('apis.attendance', 'Attendance'),
            ('apis.attendance', 'Holiday')
        ],
    }
    
    models_to_backup = []
    if table == 'full':
        models_to_backup = [
            ('user', 'CustomUser'),
            ('apis.settings', 'CompanySettings'),
            ('apis.proposal', 'Client'),
            ('apis.proposal', 'Proposal'),
            ('apis.proposal', 'ProposalSection'),
            ('apis.proposal', 'ProposalService'),
            ('apis.invoice', 'Invoice'),
            ('apis.invoice', 'InvoiceItem'),
            ('apis.invoice', 'InvoiceAdditionalCharge'),
            ('apis.transactions', 'Transaction'),
            ('apis.attendance', 'Attendance'),
            ('apis.attendance', 'Holiday'),
            # Lead management — ordered by FK depth
            ('apis.leads', 'TargetCustomerList'),
            ('apis.leads', 'TargetCustomer'),
            ('apis.leads', 'Lead'),
            ('apis.leads', 'LeadAssignmentHistory'),
            ('apis.leads', 'LeadCall'),
            ('apis.leads', 'LeadFollowUp'),
            ('apis.leads', 'LeadMeeting'),
            ('apis.leads', 'ProductDemo'),
            ('apis.leads', 'ServiceRequirement'),
            ('apis.leads', 'LeadRequirementItem'),
            ('apis.leads', 'LeadCostEstimate'),
            ('apis.leads', 'LeadTask'),
            ('apis.leads', 'LeadDocument'),
            ('apis.leads', 'LeadRejection'),
            ('apis.leads', 'LeadConversion'),
            ('apis.leads', 'LeadActivity'),
        ]
    elif table in mapping:
        models_to_backup = mapping[table]
    else:
        return Response({'error': 'Invalid table name'}, status=status.HTTP_400_BAD_REQUEST)
    
    backup_data = []
    for app_label, model_name in models_to_backup:
        try:
            model = apps.get_model(app_label, model_name)
            queryset = model.objects.all()
            
            # Apply specific filters for separated backups
            if table == 'invoices':
                if model_name == 'Invoice':
                    queryset = queryset.filter(is_proforma=False)
                elif model_name in ['InvoiceItem', 'InvoiceAdditionalCharge']:
                    queryset = queryset.filter(invoice__is_proforma=False)
            elif table == 'performa':
                if model_name == 'Invoice':
                    queryset = queryset.filter(is_proforma=True)
                elif model_name in ['InvoiceItem', 'InvoiceAdditionalCharge']:
                    queryset = queryset.filter(invoice__is_proforma=True)

            data = serializers.serialize('json', queryset)
            backup_data.extend(json.loads(data))
        except Exception as e:
            logger.error(f"Error backing up {app_label}.{model_name}: {e}")
            
    response = HttpResponse(json.dumps(backup_data, indent=2), content_type='application/json')
    filename = f"adstra_{table}_backup.json"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def import_backup(request):
    denial = require_permission(request, "backup.import")
    if denial:
        return denial
    if 'file' not in request.FILES:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
    backup_file = request.FILES['file']
    try:
        backup_data = json.load(backup_file)
        
        with db_transaction.atomic():
            # Clear existing data in reverse dependency order
            models_to_clear = [
                ('apis.attendance', 'Holiday'),
                ('apis.attendance', 'Attendance'),
                ('apis.transactions', 'Transaction'),
                ('apis.invoice', 'InvoiceAdditionalCharge'),
                ('apis.invoice', 'InvoiceItem'),
                ('apis.invoice', 'Invoice'),
                ('apis.proposal', 'ProposalService'),
                ('apis.proposal', 'ProposalSection'),
                ('apis.proposal', 'Proposal'),
                ('apis.proposal', 'Client'),
                ('apis.settings', 'CompanySettings'),
                ('user', 'CustomUser'),
            ]
            
            for app_label, model_name in models_to_clear:
                try:
                    model = apps.get_model(app_label, model_name)
                    model.objects.all().delete()
                except Exception as e:
                    logger.error(f"Error clearing {app_label}.{model_name}: {e}")

            # Restore data using Django's deserializer
            for obj in serializers.deserialize('json', json.dumps(backup_data)):
                # When restoring CustomUser, we might need to handle passwords or sessions
                # but deserialize().save() should handle basic field restoration.
                obj.save()
                
        return Response({'message': 'Backup restored successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("Restore failed")
        return Response({'error': f"Restore failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audit_logs_view(request):
    denial = require_permission(request, "settings.view")
    if denial:
        return denial
    logs = AuditLog.objects.all().select_related('user').order_by('-timestamp')[:200]
    serializer = AuditLogSerializer(logs, many=True)
    return Response(serializer.data)

from django.views.decorators.cache import never_cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import CompanySettings
from .serializers import CompanySettingsSerializer

@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
@never_cache
def company_settings_view(request):
    settings_obj = CompanySettings.objects.first()
    
    if not settings_obj:
        # Create default settings if none exist
        settings_obj = CompanySettings.objects.create()

    if request.method == 'GET':
        serializer = CompanySettingsSerializer(settings_obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        print(f"DEBUG: Received settings update: {request.data}")
        serializer = CompanySettingsSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            print("DEBUG: Settings saved successfully")
            return Response(serializer.data)
        print(f"DEBUG: Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

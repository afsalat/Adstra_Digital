from rest_framework import serializers
from .models import CompanySettings, AuditLog

class CompanySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySettings
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.fullname', read_only=True, default="System")
    username = serializers.CharField(source='user.username', read_only=True, default="system")

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_name', 'username', 'action', 'details', 'timestamp', 'ip_address']

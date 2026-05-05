from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'password', 'joining_date', 'phone', 'email', 'address', 'designation', 'department', 'is_team_lead', 'fullname', 'is_active', 'is_staff', 'is_superuser']
        read_only_fields = ['id', 'joining_date', 'is_staff', 'is_superuser']

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.password = password
        return super().update(instance, validated_data)

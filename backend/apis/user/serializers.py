from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import CustomUser
from utils.permissions import PERMISSIONS, effective_permissions, normalize_permissions

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    effective_permissions = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'password', 'joining_date', 'phone', 'email', 'address',
            'designation', 'department', 'role', 'custom_permissions', 'effective_permissions',
            'is_team_lead', 'fullname', 'is_active', 'is_staff', 'is_superuser'
        ]
        read_only_fields = ['id', 'joining_date', 'is_staff', 'is_superuser']

    def get_effective_permissions(self, obj):
        return effective_permissions(obj)

    def validate_password(self, value):
        if value:
            try:
                validate_password(value, user=self.instance)
            except DjangoValidationError as e:
                raise serializers.ValidationError(list(e.messages))
        return value

    def validate_custom_permissions(self, value):
        invalid_codes = sorted(set(value or []) - (set(PERMISSIONS) | {"*"}))
        if invalid_codes:
            raise serializers.ValidationError(f"Invalid permission codes: {', '.join(invalid_codes)}")
        return normalize_permissions(value)

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

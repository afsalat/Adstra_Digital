from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'password', 'joining_date', 'phone', 'email', 'address', 'designation', 'fullname', 'is_active']
        read_only_fields = ['id', 'date']

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.password = password
        return super().update(instance, validated_data)

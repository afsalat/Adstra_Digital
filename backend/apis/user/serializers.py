from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'password', 'joining_date', 'phone', 'email', 'address', 'designation', 'fullname']
        read_only_fields = ['id', 'date']  # joining_date usually auto set, so read-only

    def create(self, validated_data):
        # Password already hashed in view, but if you want to hash here:
        # validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.password = password  # Assume already hashed in view
        return super().update(instance, validated_data)

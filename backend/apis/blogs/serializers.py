from rest_framework import serializers
from .models import Blog, KeywordLink

class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = '__all__'

class KeywordLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeywordLink
        fields = '__all__'


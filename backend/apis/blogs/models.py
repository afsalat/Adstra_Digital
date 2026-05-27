from django.db import models

class Blog(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    excerpt = models.TextField(blank=True, null=True)
    imageUrl = models.CharField(max_length=255, blank=True, null=True)
    excerptTitle = models.CharField(max_length=255, blank=True, null=True)
    metaDescription = models.TextField(blank=True, null=True)
    author = models.CharField(max_length=100, default='Adstra Digital Team')
    publishedDate = models.DateField()
    readingTime = models.CharField(max_length=50, default='8 min read')
    tags = models.JSONField(default=list, blank=True)
    seo = models.JSONField(default=dict, blank=True)
    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class KeywordLink(models.Model):
    keyword = models.CharField(max_length=255, unique=True)
    link = models.CharField(max_length=512)
    link_type = models.CharField(max_length=50, default='internal')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.keyword} -> {self.link} ({self.link_type})"


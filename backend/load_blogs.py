import os
import json
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apis.blogs.models import Blog

def load_blogs():
    with open('blogs.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)
    
    print(f"Loaded {len(posts)} posts from JSON.")
    
    created_count = 0
    updated_count = 0
    
    for p in posts:
        published_date_str = p.get('publishedDate', '')
        try:
            published_date = datetime.strptime(published_date_str, '%Y-%m-%d').date()
        except Exception:
            published_date = datetime.now().date()
            
        tags = p.get('tags', [])
        if not isinstance(tags, list):
            tags = [tags] if tags else []
            
        seo = p.get('seo', {})
        if not isinstance(seo, dict):
            seo = {'raw': seo}
            
        blog, created = Blog.objects.update_or_create(
            slug=p.get('slug'),
            defaults={
                'title': p.get('title', ''),
                'excerpt': p.get('excerpt', ''),
                'imageUrl': p.get('imageUrl', ''),
                'excerptTitle': p.get('excerptTitle', ''),
                'metaDescription': p.get('metaDescription', ''),
                'author': p.get('author', 'Adstra Digital Team'),
                'publishedDate': published_date,
                'readingTime': p.get('readingTime', '8 min read'),
                'tags': tags,
                'seo': seo,
                'content': p.get('content', '')
            }
        )
        if created:
            created_count += 1
        else:
            updated_count += 1
            
    print(f"Migration completed! Created: {created_count}, Updated: {updated_count}")

if __name__ == '__main__':
    load_blogs()

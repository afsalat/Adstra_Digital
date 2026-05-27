import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from utils.jwt_helper import generate_jwt
from apis.user.models import CustomUser
from apis.blogs.models import Blog
import requests

u = CustomUser.objects.filter(is_superuser=True).first()
token = generate_jwt(u.id)

headers = {'Authorization': f'Bearer {token}'}

blog = Blog.objects.get(slug='website-development-high-converting-brands-2026')
payload = {
    "title": blog.title + " Updated",
    "slug": blog.slug,
    "excerpt": blog.excerpt,
    "imageUrl": blog.imageUrl,
    "excerptTitle": blog.excerptTitle,
    "metaDescription": blog.metaDescription,
    "author": blog.author,
    "publishedDate": str(blog.publishedDate),
    "readingTime": blog.readingTime,
    "tags": blog.tags,
    "content": blog.content,
    "seo": blog.seo
}

res = requests.put('http://localhost:8000/api/blogs/website-development-high-converting-brands-2026/', json=payload, headers=headers)
print("STATUS:", res.status_code)
print("RESPONSE:", res.text[:1000])

from rest_framework import viewsets, permissions, response
from rest_framework.decorators import action
from .models import Blog, KeywordLink
from .serializers import BlogSerializer, KeywordLinkSerializer
import os
import re
import time
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

class BlogViewSet(viewsets.ModelViewSet):
    queryset = Blog.objects.all().order_by('-publishedDate')
    serializer_class = BlogSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'upload_image']:
            # We can allow authenticated users to upload, or let the standard permission handle it
            if self.action == 'upload_image':
                return [permissions.IsAuthenticated()]
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['post'], url_path='upload')
    def upload_image(self, request):
        file = request.FILES.get('file') or request.FILES.get('image')
        if not file:
            return response.Response({'error': 'No file uploaded'}, status=400)
            
        media_dir = os.path.join(settings.MEDIA_ROOT, 'blog_images')
        if not os.path.exists(media_dir):
            os.makedirs(media_dir)
            
        # Clean and sanitize the filename
        base, ext = os.path.splitext(file.name)
        clean_base = re.sub(r'[^a-zA-Z0-9_\-]', '_', base)
        filename = f"{clean_base}_{int(time.time())}{ext}"
        
        file_path = os.path.join('blog_images', filename)
        saved_path = default_storage.save(file_path, ContentFile(file.read()))
        
        # Build relative URL matching settings.MEDIA_URL
        full_url = f"{settings.MEDIA_URL}{saved_path}"
        return response.Response({'url': full_url}, status=200)

class KeywordLinkViewSet(viewsets.ModelViewSet):
    queryset = KeywordLink.objects.all().order_by('keyword')
    serializer_class = KeywordLinkSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        if KeywordLink.objects.count() == 0:
            DEFAULT_KEYWORDS = {
                "AEO": "/blogs/seo-aeo-geo-ppc-2025-digital-strategy/",
                "GEO": "/blogs/seo-aeo-geo-ppc-2025-digital-strategy/",
                "PPC": "/blogs/seo-aeo-geo-ppc-2025-digital-strategy/",
                "SEO": "/service/seo-website-optimization/",
                "SEO Services": "/service/seo-website-optimization/",
                "Google Ads": "/service/google-ads/",
                "Google Business Management Services": "/service/google-ads/",
                "Paid Advertising Services": "/service/google-ads/",
                "Content Marketing": "/service/content-marketing/",
                "Digital Marketing": "/service/content-marketing/",
                "Marketing Strategies": "/blogs/seo-aeo-geo-ppc-2025-digital-strategy/",
                "Branding": "/service/branding/",
                "brand voice": "/service/branding/",
                "branding strategies": "/service/branding/",
                "branding audit": "/service/branding/",
                "branding strategy": "/service/branding/",
                "responsive logo": "/blogs/branding-trends-2025-logo-design-marketing/",
                "animated logos": "/blogs/branding-trends-2025-logo-design-marketing/",
                "Logo Design": "/blogs/branding-trends-2025-logo-design-marketing/",
                "Photography": "/blogs/in-house-video-photography/",
                "Video": "/blogs/in-house-video-photography/",
                "video editing": "/service/video-production/",
                "video production company": "/service/video-production/",
                "corporate video shoot": "/service/video-production/",
                "video shoot in Kerala": "/service/video-production/",
                "visual storytelling": "/blogs/in-house-video-photography/",
                "in-house video production": "/blogs/in-house-video-photography/",
                "in-house photography": "/blogs/in-house-video-photography/",
                "Adstra Digital": "/about/",
                "creative ideas": "/blogs/birth-of-creativity-ideas/",
                "creative mindset": "/blogs/birth-of-creativity-ideas/",
                "creative journey": "/blogs/birth-of-creativity-ideas/",
                "storytelling": "/blogs/birth-of-creativity-ideas/",
                "creative process": "/blogs/birth-of-creativity-ideas/",
                "imagination": "/blogs/birth-of-creativity-ideas/",
                "creative resources": "/blogs/all/",
                "client feedback": "/blogs/ai-marketing-benefits-business-growth/",
                "Contact us": "https://adstradigital.com/#contact",
                "contact page": "https://adstradigital.com/#contact",
                "Marketing & Creativity Blogs": "/blogs/all/",
                "content creation": "/service/content-marketing/",
                "CRM": "/service/content-marketing/",
                "AI Marketing": "/blogs/ai-marketing-benefits-business-growth/",
                "automation tools": "/blogs/ai-marketing-benefits-business-growth/",
                "predictive analytics": "/blogs/ai-marketing-benefits-business-growth/",
                "smart ad targeting": "/blogs/ai-marketing-benefits-business-growth/",
                "Google SGE": "/blogs/google-sge-ai-search-impact-2025/",
                "AI-powered search": "/blogs/google-sge-ai-search-impact-2025/",
                "SGE": "/blogs/google-sge-ai-search-impact-2025/",
                "Search Generative Experience": "/blogs/google-sge-ai-search-impact-2025/",
                "E-A-T": "/blogs/google-sge-ai-search-impact-2025/",
                "EAT": "/blogs/google-sge-ai-search-impact-2025/",
                "Core Web Vitals": "/blogs/google-sge-ai-search-impact-2025/",
                "Local SEO": "/blogs/google-sge-ai-search-impact-2025/",
                "conversational keywords": "/blogs/google-sge-ai-search-impact-2025/",
                "structured data": "/blogs/google-sge-ai-search-impact-2025/",
                "PMax": "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
                "asset groups": "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
                "audience signals": "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
                "search term insights": "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
                "first-party data": "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
                "page feeds": "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
                "creative insights/": "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
                "automated bidding": "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
                "ROAS": "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
                "GA4": "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
                "digital marketing": "/service/content-marketing/",
                "Social Media Conversion": "/blogs/social-media-strategy-to-boost-your-conversion-rate/",
                "Engagement Rate": "/blogs/social-media-strategy-to-boost-your-conversion-rate/",
                "Shoppable Posts": "/blogs/social-media-strategy-to-boost-your-conversion-rate/",
                "Retargeting Ads": "/blogs/social-media-strategy-to-boost-your-conversion-rate/",
                "Customer Retention": "/blogs/social-media-strategy-to-boost-your-conversion-rate/",
                "Conversion Optimization": "/blogs/social-media-strategy-to-boost-your-conversion-rate/",
                "Mobile-Friendly Landing Pages": "/blogs/social-media-strategy-to-boost-your-conversion-rate/",
                "Audience Segmentation": "/blogs/social-media-strategy-to-boost-your-conversion-rate/",
                "Customer Journey Mapping": "/blogs/social-media-strategy-to-boost-your-conversion-rate/",
                "Calls to Action (CTAs)": "/blogs/social-media-strategy-to-boost-your-conversion-rate/",
                "eCommerce app": "/blogs/ecommerce-app-development-pricing-features-budget/",
                "Mobile shopping": "/blogs/ecommerce-app-development-pricing-features-budget/",
                "Payment gateway": "/blogs/ecommerce-app-development-pricing-features-budget/",
                "Shopping app": "/blogs/ecommerce-app-development-pricing-features-budget/",
                "Budget planning": "/blogs/ecommerce-app-development-pricing-features-budget/",
                "App features": "/blogs/ecommerce-app-development-pricing-features-budget/",
                "Order tracking": "/blogs/ecommerce-app-development-pricing-features-budget/",
                "Product catalog": "/blogs/ecommerce-app-development-pricing-features-budget/",
                "Wishlist": "/blogs/ecommerce-app-development-pricing-features-budget/",
                "Cart": "/blogs/ecommerce-app-development-pricing-features-budget/",
                "Push notifications": "/blogs/ecommerce-app-development-pricing-features-budget/",
                "Admin panel": "/blogs/ecommerce-app-development-pricing-features-budget/",
                "Multi-vendor": "/blogs/ecommerce-app-development-pricing-features-budget/",
                "App maintenance": "/blogs/ecommerce-app-development-pricing-features-budget/",
                "Conversational Search": "/blogs/conversational-search-ai-trends-digital-marketing-2026/",
                "AI Trends": "/blogs/conversational-search-ai-trends-digital-marketing-2026/",
                "conversational SEO": "/blogs/conversational-search-ai-trends-digital-marketing-2026/",
                "AI Overviews": "/blogs/conversational-search-ai-trends-digital-marketing-2026/",
                "Generative Engine Optimization": "/blogs/conversational-search-ai-trends-digital-marketing-2026/",
                "AI social media tools": "/blogs/best-ai-social-media-tools-brands-creators-agencies-2026/",
                "AI automation": "/blogs/best-ai-social-media-tools-brands-creators-agencies-2026/",
                "AI content marketing": "/blogs/best-ai-social-media-tools-brands-creators-agencies-2026/",
                "Smart scheduling": "/blogs/best-ai-social-media-tools-brands-creators-agencies-2026/",
                "AI chatbots": "/blogs/best-ai-social-media-tools-brands-creators-agencies-2026/",
                "YouTube SEO Tips": "/blogs/25-practical-youtube-seo-tips-boost-video-rankings/",
                "YouTube video optimization": "/blogs/25-practical-youtube-seo-tips-boost-video-rankings/",
                "YouTube ranking factors": "/blogs/25-practical-youtube-seo-tips-boost-video-rankings/",
                "Video SEO strategy": "/blogs/25-practical-youtube-seo-tips-boost-video-rankings/",
            }
            links_to_create = []
            for kw, url in DEFAULT_KEYWORDS.items():
                is_internal = url.startswith('/') or 'adstradigital.com' in url or 'localhost' in url or '127.0.0.1' in url
                links_to_create.append(KeywordLink(
                    keyword=kw,
                    link=url,
                    link_type='internal' if is_internal else 'external'
                ))
            KeywordLink.objects.bulk_create(links_to_create, ignore_conflicts=True)
            self.queryset = KeywordLink.objects.all().order_by('keyword')

        return super().list(request, *args, **kwargs)


import os
import sys
from pathlib import Path

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import django
from datetime import datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apis.proposal.models import Client
from apis.user.models import CustomUser
from apis.social.models import (
    SocialClientProfile,
    SocialAccount,
    SocialCampaign,
    SocialMediaAsset,
    SocialPost,
    PostApprovalHistory,
    SocialInboxMessage,
    SocialDailyAnalytics,
)
from apis.social.services import record_approval_action

def seed_social():
    print("[+] Seeding Social Media Management data...")
    admin_user = CustomUser.objects.filter(role__in=['super_admin', 'admin']).first()
    if not admin_user:
        admin_user = CustomUser.objects.first()

    # 1. Clients
    # Check or create microsoft CRM client
    vorion_crm_client, _ = Client.objects.get_or_create(
        company_name="microsoft",
        defaults={
            "name": "Rahman K",
            "contact": "+91 98471 23456",
            "email": "connect@vorionnexus.com",
            "address": "Tech Zone, Infopark, Kochi, Kerala",
        }
    )

    adstra_crm_client = Client.objects.filter(company_name__icontains="Adstra").first()

    # Social Client Profiles
    vorion_profile, _ = SocialClientProfile.objects.update_or_create(
        slug="vorion-nexus",
        defaults={
            "client": vorion_crm_client,
            "name": "microsoft",
            "logo_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
            "primary_color": "#0ea5e9",
            "secondary_color": "#6366f1",
            "brand_tagline": "Next-Gen AI & Digital Transformation Solutions",
            "target_monthly_posts": 25,
            "package_tier": "Enterprise Digital Growth",
            "client_email": "marketing@vorionnexus.com",
            "client_contact": "+91 98471 23456",
            "approval_policy": "client_required",
            "notes": "Premium B2B client focusing on enterprise AI, software modernization, and cloud scale. Brand tone: authoritative, visionary, innovative.",
        }
    )

    adstra_profile, _ = SocialClientProfile.objects.update_or_create(
        slug="adstra-digital",
        defaults={
            "client": adstra_crm_client,
            "name": "Adstra Digital",
            "logo_url": "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80",
            "primary_color": "#4f46e5",
            "secondary_color": "#10b981",
            "brand_tagline": "The Sole of a Premium Digital Marketing Brand",
            "target_monthly_posts": 30,
            "package_tier": "Agency Brand Command",
            "client_email": "hello@adstradigital.com",
            "client_contact": "+91 97450 11223",
            "approval_policy": "internal_only",
            "notes": "Agency self-marketing campaigns, performance marketing case studies, webinars, and Kerala entrepreneur spotlights.",
        }
    )

    # 2. Social Accounts
    accounts_data = [
        # microsoft accounts
        {
            "client_profile": vorion_profile,
            "platform": "instagram",
            "account_name": "microsoft Official",
            "account_id": "ig_vorion_nexus",
            "username": "@vorionnexus",
            "profile_picture": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
            "status": "connected",
            "token_expiry": timezone.now() + timedelta(days=78),
            "followers_count": 18450,
            "metadata": {"reels_count": 84, "avg_reach": 12800}
        },
        {
            "client_profile": vorion_profile,
            "platform": "linkedin",
            "account_name": "microsoft Technologies",
            "account_id": "li_vorion_tech",
            "username": "vorion-nexus",
            "profile_picture": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80",
            "status": "connected",
            "token_expiry": timezone.now() + timedelta(days=45),
            "followers_count": 34200,
            "metadata": {"impressions_30d": 182000}
        },
        {
            "client_profile": vorion_profile,
            "platform": "facebook",
            "account_name": "microsoft Business Hub",
            "account_id": "fb_vorion_hub",
            "username": "vorionnexus.global",
            "profile_picture": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80",
            "status": "token_expiring",
            "token_expiry": timezone.now() + timedelta(days=4),
            "followers_count": 12900,
            "metadata": {"warning": "Token expires in 4 days"}
        },

        # Adstra Digital accounts
        {
            "client_profile": adstra_profile,
            "platform": "instagram",
            "account_name": "Adstra Digital Agency",
            "account_id": "ig_adstra_digital",
            "username": "@adstradigital",
            "profile_picture": "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80",
            "status": "connected",
            "token_expiry": timezone.now() + timedelta(days=82),
            "followers_count": 42100,
            "metadata": {"engagement_rate": 5.8}
        },
        {
            "client_profile": adstra_profile,
            "platform": "youtube",
            "account_name": "Adstra Digital Academy & Insights",
            "account_id": "yt_adstra_academy",
            "username": "@AdstraDigitalHQ",
            "profile_picture": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80",
            "status": "connected",
            "token_expiry": timezone.now() + timedelta(days=120),
            "followers_count": 19800,
            "metadata": {"subscribers": 19800, "videos_count": 42}
        },
        {
            "client_profile": adstra_profile,
            "platform": "google_business",
            "account_name": "Adstra Digital HQ - Kochi & Calicut",
            "account_id": "gmb_adstra_hq",
            "username": "Adstra Digital Marketing",
            "profile_picture": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=120&auto=format&fit=crop&q=80",
            "status": "connected",
            "token_expiry": timezone.now() + timedelta(days=90),
            "followers_count": 3200,
            "metadata": {"rating": 4.9, "reviews_count": 184}
        },
        {
            "client_profile": adstra_profile,
            "platform": "x",
            "account_name": "Adstra Digital",
            "account_id": "x_adstra_hq",
            "username": "@AdstraHQ",
            "profile_picture": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=120&auto=format&fit=crop&q=80",
            "status": "connected",
            "token_expiry": timezone.now() + timedelta(days=60),
            "followers_count": 8950,
            "metadata": {"tweets_count": 512}
        },
    ]

    for acc_info in accounts_data:
        SocialAccount.objects.update_or_create(
            client_profile=acc_info["client_profile"],
            account_id=acc_info["account_id"],
            defaults=acc_info
        )

    # 3. Campaigns
    c1, _ = SocialCampaign.objects.update_or_create(
        client_profile=vorion_profile,
        name="Vorion Q3 AI Acceleration Campaign",
        defaults={
            "objective": "lead_generation",
            "budget": 75000.00,
            "spent": 38400.00,
            "start_date": timezone.now().date() - timedelta(days=15),
            "end_date": timezone.now().date() + timedelta(days=30),
            "target_audience": "CTOs, Founders, Engineering Leaders across India & UAE",
            "platforms": ["linkedin", "instagram", "facebook"],
            "status": "active"
        }
    )

    c2, _ = SocialCampaign.objects.update_or_create(
        client_profile=adstra_profile,
        name="Adstra Kerala Business Growth Drive 2026",
        defaults={
            "objective": "conversions",
            "budget": 50000.00,
            "spent": 21500.00,
            "start_date": timezone.now().date() - timedelta(days=10),
            "end_date": timezone.now().date() + timedelta(days=35),
            "target_audience": "Kerala Retail, Healthcare, Hospitalities & D2C Brands",
            "platforms": ["instagram", "youtube", "facebook"],
            "status": "active"
        }
    )

    # 4. Media Library Assets
    media_samples = [
        {
            "client_profile": vorion_profile,
            "title": "Vorion AI Engine Blueprint Diagram",
            "asset_type": "image",
            "file_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
            "folder": "Brand Assets",
            "file_size_bytes": 1450000,
            "file_format": "PNG",
            "approval_status": "approved",
            "tags": ["AI", "Tech", "Architecture", "Infographic"]
        },
        {
            "client_profile": vorion_profile,
            "title": "Client Case Study - FinTech Cloud Scalability",
            "asset_type": "carousel",
            "file_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
            "folder": "Creatives",
            "file_size_bytes": 2200000,
            "file_format": "JPG",
            "approval_status": "approved",
            "tags": ["Case Study", "Fintech", "Cloud"]
        },
        {
            "client_profile": vorion_profile,
            "title": "microsoft Vector Logo Package",
            "asset_type": "logo",
            "file_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
            "folder": "Logos",
            "file_size_bytes": 540000,
            "file_format": "SVG",
            "approval_status": "approved",
            "tags": ["Brand Identity", "Vector", "Logo"]
        },
        {
            "client_profile": adstra_profile,
            "title": "Adstra Digital Master Reel - ROI Breakdown",
            "asset_type": "reel",
            "file_url": "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800&auto=format&fit=crop&q=80",
            "folder": "Reels",
            "file_size_bytes": 18400000,
            "file_format": "MP4",
            "approval_status": "approved",
            "tags": ["Reel", "ROI", "Marketing Strategy", "Performance"]
        },
        {
            "client_profile": adstra_profile,
            "title": "Malayalam Social Media Strategy Guide Creative",
            "asset_type": "image",
            "file_url": "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80",
            "folder": "Creatives",
            "file_size_bytes": 1850000,
            "file_format": "PNG",
            "approval_status": "approved",
            "tags": ["Malayalam", "Adstra", "Guide", "Creative"]
        },
    ]

    for m in media_samples:
        SocialMediaAsset.objects.get_or_create(
            client_profile=m["client_profile"],
            title=m["title"],
            defaults={**m, "uploaded_by": admin_user}
        )

    # 5. Content Posts & Approval Workflows
    now = timezone.now()
    posts_data = [
        {
            "client_profile": vorion_profile,
            "campaign": c1,
            "title": "Scaling Enterprise AI: 5 Architectural Mistakes",
            "post_type": "carousel",
            "platforms": ["linkedin", "instagram"],
            "primary_caption": "Building an AI roadmap is not just about choosing LLMs — it's about scalable orchestration, data pipelines, and security governance.\n\nSwipe through for the 5 most common architecture bottlenecks we solve for enterprise teams.",
            "platform_captions": {
                "linkedin": "Architecting robust enterprise intelligence requires disciplined data pipelines and latency optimization. Here is how microsoft modernizes core infra for high-throughput AI workloads.",
                "instagram": "Are you scaling AI without these 5 architectural pillars? ⚠️ Save this carousel before planning your Q4 roadmap!"
            },
            "hashtags": "#EnterpriseAI #CloudArchitecture #VorionNexus #SoftwareEngineering #CTOInsights",
            "location": "Infopark Kochi",
            "first_comment": "Read the full engineering whitepaper at vorionnexus.com/insights",
            "media_urls": ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80"],
            "scheduled_at": now + timedelta(days=1, hours=4),
            "status": "scheduled",
            "checklist": [{"task": "Carousel slides approved", "done": True}, {"task": "Caption verified", "done": True}],
        },
        {
            "client_profile": vorion_profile,
            "campaign": c1,
            "title": "microsoft Product Showcase: Smart Analytics",
            "post_type": "image",
            "platforms": ["facebook", "linkedin"],
            "primary_caption": "Real-time decision intelligence tailored for modern leadership. Discover how microsoft unified data infrastructure delivers sub-second insights.",
            "hashtags": "#DataAnalytics #BusinessIntelligence #TechLeaders #Vorion",
            "location": "Bangalore / Kochi",
            "media_urls": ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80"],
            "scheduled_at": now + timedelta(days=2, hours=2),
            "status": "client_review",
            "checklist": [{"task": "Graphic finished", "done": True}, {"task": "Awaiting client review", "done": False}],
        },
        {
            "client_profile": vorion_profile,
            "title": "Weekend Leadership Insight - Focus & Velocity",
            "post_type": "text",
            "platforms": ["linkedin"],
            "primary_caption": "Speed without direction is just friction. The fastest engineering teams aren't typing faster—they are eliminating ambiguity before writing a single line of code.",
            "hashtags": "#Leadership #EngineeringCulture #StartupVelocity",
            "status": "internal_review",
            "scheduled_at": now + timedelta(days=3),
        },
        {
            "client_profile": adstra_profile,
            "campaign": c2,
            "title": "Why 80% of Ad Spend Fails Without Conversion Tracking",
            "post_type": "reel",
            "platforms": ["instagram", "youtube", "facebook"],
            "primary_caption": "നിങ്ങളുടെ ബിസിനസ്സ് മാർക്കറ്റിംഗിൽ ബഡ്ജറ്റ് വെറുതെ പാഴാകുന്നുണ്ടോ? കൃത്യമായ കൺവേർഷൻ ട്രാക്കിംഗ് ഇല്ലാതെ പരസ്യങ്ങൾ ചെയ്യുന്നത് വഴി പണം നഷ്ടപ്പെടാം.\n\nWatch this breakdown by Afsal AT and the Adstra Digital growth team!",
            "platform_captions": {
                "instagram": "Stop burning ad budgets on vanity metrics! 💸 In this reel, we show the 3 tracking pixels every Kerala e-commerce brand must implement.",
                "youtube": "Full masterclass on setting up Meta Conversions API & GA4 for high-ROI sales."
            },
            "hashtags": "#DigitalMarketingKerala #AdstraDigital #AfsalAT #PerformanceMarketing #BusinessGrowth",
            "location": "Adstra Digital Studio, Calicut",
            "media_urls": ["https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800&auto=format&fit=crop&q=80"],
            "scheduled_at": now + timedelta(hours=6),
            "status": "scheduled",
            "checklist": [{"task": "Reel edited with Malayalam subtitles", "done": True}, {"task": "Thumbnail ready", "done": True}],
        },
        {
            "client_profile": adstra_profile,
            "title": "Onam & Festive Campaign Planning Blueprint",
            "post_type": "image",
            "platforms": ["instagram", "facebook"],
            "primary_caption": "ഉത്സവകാല സെയിൽസ് ഇരട്ടിയാക്കാൻ നിങ്ങളുടെ ബ്രാൻഡ് തയ്യാറാണോ? ഈ ഓണം സീസണിൽ ഉപഭോക്താക്കളിലേക്ക് വേഗത്തിൽ എത്തിച്ചേരാൻ മികച്ച ഡിജിറ്റൽ സ്ട്രാറ്റജി പ്ലാൻ ചെയ്യൂ.\n\nConnect with Adstra Digital for tailored festival campaigns.",
            "hashtags": "#OnamMarketing #KeralaBrands #FestivalOffers #AdstraDigital #CreativeAgency",
            "location": "Kerala",
            "media_urls": ["https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80"],
            "status": "published",
            "published_at": now - timedelta(days=3),
        },
        {
            "client_profile": adstra_profile,
            "title": "10x Organic Reach Secrets in 2026",
            "post_type": "image",
            "platforms": ["instagram", "x"],
            "primary_caption": "Organic reach is not dead—generic content is. Here is what algorithmic changes favor this quarter.",
            "hashtags": "#SocialMediaStrategy #GrowthHacking #AdstraMarketing",
            "status": "draft",
        },
    ]

    for p_data in posts_data:
        p, created = SocialPost.objects.update_or_create(
            client_profile=p_data["client_profile"],
            title=p_data["title"],
            defaults={
                **p_data,
                "created_by": admin_user,
                "assigned_to": admin_user,
            }
        )
        if created:
            record_approval_action(p, "created", admin_user.fullname or "Afsal AT", "Lead Strategist", "Post drafted and configured")
            if p.status in ["scheduled", "published"]:
                record_approval_action(p, "approved", "Creative Director", "Approver", "Approved for publishing")

    # 6. Social Inbox Messages
    inbox_messages = [
        {
            "client_profile": vorion_profile,
            "platform": "instagram",
            "message_type": "dm",
            "sender_name": "Dr. Vivek Menon",
            "sender_handle": "vivek_menon_md",
            "sender_phone": "+91 94471 99882",
            "sender_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            "post_context": "Vorion AI Engine Blueprint",
            "message_text": "Hi Vorion team, we run a hospital network in Calicut and are looking for an AI-based diagnostic triage workflow. Can we schedule a technical demo this week?",
            "status": "pending",
            "replies": []
        },
        {
            "client_profile": adstra_profile,
            "platform": "instagram",
            "message_type": "comment",
            "sender_name": "Sajeev Nambiar",
            "sender_handle": "sajeev_jewels",
            "sender_phone": "+91 98460 55443",
            "sender_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            "post_context": "Why 80% of Ad Spend Fails Reel",
            "message_text": "Great insights @adstradigital! We need a complete social media and Meta ads handling for our boutique jewelry brand. What are your monthly packages?",
            "status": "pending",
            "replies": []
        },
        {
            "client_profile": adstra_profile,
            "platform": "whatsapp",
            "message_type": "dm",
            "sender_name": "Ananya K",
            "sender_handle": "ananya_boutique",
            "sender_phone": "+91 99950 12345",
            "sender_avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
            "post_context": "WhatsApp Business Direct",
            "message_text": "Hello, saw your festive campaign post. Please share your agency proposal and portfolio to this number.",
            "status": "important",
            "replies": [
                {"sender": "Adstra Team", "text": "Hello Ananya, thank you for reaching out! We are preparing the portfolio tailored to boutique fashion brands.", "timestamp": (now - timedelta(hours=2)).isoformat()}
            ]
        },
        {
            "client_profile": vorion_profile,
            "platform": "linkedin",
            "message_type": "dm",
            "sender_name": "Karthik Subramanian",
            "sender_handle": "karthik-subra-cloud",
            "sender_phone": "+91 98801 66778",
            "sender_avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
            "post_context": "Enterprise AI Carousel",
            "message_text": "Read your carousel on AI orchestration. Interested in exploring partnership opportunities for our UAE enterprise clients.",
            "status": "resolved",
            "replies": [
                {"sender": "microsoft", "text": "Thank you Karthik, our VP of Partnerships will connect with you tomorrow.", "timestamp": (now - timedelta(days=1)).isoformat()}
            ]
        },
    ]

    for msg_data in inbox_messages:
        SocialInboxMessage.objects.get_or_create(
            client_profile=msg_data["client_profile"],
            sender_name=msg_data["sender_name"],
            message_text=msg_data["message_text"],
            defaults=msg_data
        )

    # 7. Daily Analytics for past 30 days
    today = timezone.now().date()
    for i in range(30, -1, -1):
        d = today - timedelta(days=i)
        # Vorion
        SocialDailyAnalytics.objects.update_or_create(
            client_profile=vorion_profile,
            date=d,
            platform="linkedin",
            defaults={
                "followers": 32000 + (30 - i) * 75,
                "follower_change": 75 if i % 2 == 0 else 40,
                "reach": 2800 + ((i * 137) % 1900),
                "impressions": 4900 + ((i * 211) % 3200),
                "engagement_rate": round(4.8 + ((i % 5) * 0.35), 2),
                "likes": 85 + (i * 3),
                "comments": 14 + (i % 8),
                "shares": 9 + (i % 6),
                "saves": 22 + (i % 12),
                "posts_published": 1 if i % 4 == 0 else 0,
                "leads_generated": 2 if i % 6 == 0 else 0,
            }
        )
        SocialDailyAnalytics.objects.update_or_create(
            client_profile=vorion_profile,
            date=d,
            platform="instagram",
            defaults={
                "followers": 17000 + (30 - i) * 50,
                "follower_change": 50 if i % 3 == 0 else 30,
                "reach": 3400 + ((i * 189) % 2400),
                "impressions": 5800 + ((i * 280) % 4100),
                "engagement_rate": round(5.2 + ((i % 4) * 0.4), 2),
                "likes": 120 + (i * 4),
                "comments": 22 + (i % 9),
                "shares": 18 + (i % 7),
                "saves": 35 + (i % 15),
                "posts_published": 1 if i % 3 == 0 else 0,
                "leads_generated": 1 if i % 5 == 0 else 0,
            }
        )
        # Adstra
        SocialDailyAnalytics.objects.update_or_create(
            client_profile=adstra_profile,
            date=d,
            platform="instagram",
            defaults={
                "followers": 40000 + (30 - i) * 70,
                "follower_change": 70 if i % 2 == 0 else 45,
                "reach": 5200 + ((i * 240) % 3500),
                "impressions": 8900 + ((i * 350) % 5200),
                "engagement_rate": round(5.9 + ((i % 3) * 0.5), 2),
                "likes": 210 + (i * 6),
                "comments": 38 + (i % 14),
                "shares": 29 + (i % 11),
                "saves": 54 + (i % 20),
                "posts_published": 1 if i % 2 == 0 else 0,
                "leads_generated": 3 if i % 4 == 0 else 0,
            }
        )

    print("[OK] Successfully seeded Social Media Management module with microsoft & Adstra Digital!")

if __name__ == "__main__":
    seed_social()

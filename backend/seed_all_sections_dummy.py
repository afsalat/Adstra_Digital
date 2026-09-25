import os
import sys
from pathlib import Path
from datetime import timedelta
import django
from django.utils import timezone

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apis.user.models import CustomUser
from apis.social.models import SocialClientProfile, SocialPost, SocialCampaign
from apis.social.services import record_approval_action

def run_seed():
    print("[*] Seeding comprehensive dummy data for all 7 workflow sections...")
    admin_user = CustomUser.objects.filter(role__in=['super_admin', 'admin']).first() or CustomUser.objects.first()

    profiles = SocialClientProfile.objects.all()
    if not profiles.exists():
        print("[!] No SocialClientProfile found. Please run seed_social first.")
        return

    now = timezone.now()

    # Target clients: V J Food Industries, Vorion Nexus, Adstra Digital, etc.
    vj_profile = profiles.filter(name__icontains="V J Food").first()
    adstra_profile = profiles.filter(name__icontains="Adstra").first()
    vorion_profile = profiles.filter(name__icontains="Vorion").first()

    client_targets = [p for p in [vj_profile, adstra_profile, vorion_profile] if p is not None]
    if not client_targets:
        client_targets = list(profiles[:3])

    # 1. V J Food Industries Posts across all 7 stages
    if vj_profile:
        print(f"[+] Creating dummy posts for {vj_profile.name} across all 7 stages...")
        vj_posts = [
            # 1. Scripts (Stage 1)
            {
                "title": "Crispy Kerala Banana Chips - The Secret Recipe Teaser",
                "post_type": "reel",
                "platforms": ["instagram", "facebook"],
                "status": "script",
                "priority": "high",
                "primary_caption": "Why do homemade banana chips never get this golden crunch? 🍌✨ Watch as we show how fresh Nendran bananas meet pure hot coconut oil.",
                "script_notes": "Hook: Extreme close up of raw banana sliced straight into bubbling coconut oil with sizzling audio.\nAngle: Authenticity and nostalgic village taste.\nCTA: Drop a 💛 if your evening tea is incomplete without upperi!",
                "hashtags": "#VJFoods #KeralaChips #BananaChips #UpperiLove #KeralaSnacks #AuthenticTaste",
                "location": "Kozhikode, Kerala",
                "media_urls": ["https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80"],
                "checklist": [{"task": "Hook written", "done": True}, {"task": "Audio selected", "done": False}]
            },
            {
                "title": "Weekend Malabar Biryani Masala Kit Launch",
                "post_type": "carousel",
                "platforms": ["instagram", "facebook"],
                "status": "draft",
                "priority": "medium",
                "primary_caption": "Master the art of Thalassery Biryani in under 30 minutes! 🍚🍗 Packed with authentic hand-ground Malabar spices.",
                "script_notes": "Slide 1: Thalassery Biryani aroma dilemma\nSlide 2: Ingredients break down\nSlide 3: Step by step easy cooking\nSlide 4: Launch offer & link in bio",
                "hashtags": "#BiryaniLovers #ThalasseryBiryani #VJFoodSpices #MalabarCuisine",
                "location": "Calicut",
                "media_urls": ["https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80"]
            },
            # 2. Script Approval & Review (Stage 2)
            {
                "title": "Grandma's Clay Jar Mango Pickle Heritage",
                "post_type": "video",
                "platforms": ["instagram", "youtube", "facebook"],
                "status": "script_approval",
                "priority": "urgent",
                "primary_caption": "Sun-dried in clay bharanis for 21 days with pure gingelly oil and crushed mustard. That authentic punch you grew up loving.",
                "script_notes": "Script ready for Senior Content Strategist sign-off. Focuses on slow-food heritage.",
                "hashtags": "#TraditionalPickle #KeralaFoodHeritage #MangoPickle #VJFoods #Handcrafted",
                "location": "Kerala",
                "media_urls": ["https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80"],
                "checklist": [{"task": "Storyline approved", "done": True}, {"task": "Reviewer sign-off pending", "done": False}]
            },
            {
                "title": "Behind the Scenes: Zero Adulteration Spice Milling",
                "post_type": "reel",
                "platforms": ["instagram"],
                "status": "script_approval",
                "priority": "high",
                "primary_caption": "From farm to packaging: how we test every single batch of coriander and turmeric for pure flavor without fillers.",
                "script_notes": "Script outlines industrial cleanliness, cold grinding technology, and farmer partnerships.",
                "hashtags": "#PureSpices #BehindTheScenes #VJFoodFactory #HealthyLiving",
                "location": "VJ Food Processing Facility",
                "media_urls": ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80"]
            },
            # 3. Scheduled / Designing (Stage 3)
            {
                "title": "Festive Sweet Box Special Edition Announcement",
                "post_type": "image",
                "platforms": ["instagram", "facebook"],
                "status": "designing",
                "priority": "high",
                "primary_caption": "Sweeten your celebrations with V J Foods Premium Gift Assortment! Pure ghee Mysore Pak, Halwa, and dry fruit bites.",
                "designer_notes": "Design requirements: Luxury gold packaging mockup with crimson festive motifs and high-contrast 'Order Today' button.",
                "hashtags": "#FestiveSweets #IndianSweets #GiftBox #VJFoodsFestive #SweetMoments",
                "media_urls": ["https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800&auto=format&fit=crop&q=80"],
                "checklist": [{"task": "Concept finalized", "done": True}, {"task": "Graphic rendering in progress", "done": True}, {"task": "Export 1080x1350", "done": False}]
            },
            {
                "title": "Crispy Jackfruit Chips - Seasonal Harvest Release",
                "post_type": "carousel",
                "platforms": ["instagram"],
                "status": "designing",
                "priority": "medium",
                "primary_caption": "Harvested fresh from Wayanad orchards! The sweetest raw jackfruit chips, salted to perfection.",
                "designer_notes": "Carousel slides 1 to 5: slide 1 hero shot, slides 2-4 nutrition and farm sourcing, slide 5 bag preview.",
                "hashtags": "#ChakkaChips #JackfruitChips #WayanadHarvest #VJFoodsSnacks",
                "media_urls": ["https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=800&auto=format&fit=crop&q=80"]
            },
            # 4. Team Review / Ready (Stage 4)
            {
                "title": "Fresh Idli & Dosa Batter Morning Routine",
                "post_type": "reel",
                "platforms": ["instagram", "facebook"],
                "status": "team_review",
                "priority": "medium",
                "primary_caption": "Wake up to soft, fluffy idlis and crisp golden dosas with zero prep work! Naturally fermented and stone-ground.",
                "designer_notes": "Typography and logo safe-margins adjusted. Malayalam and English subtitles embedded.",
                "hashtags": "#DosaLove #InstantBatter #MorningBreakfast #VJFoods #HealthySouthIndian",
                "location": "Kerala",
                "media_urls": ["https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80"],
                "checklist": [{"task": "Creative completed", "done": True}, {"task": "Team QA review passed", "done": True}]
            },
            # 5. Client Review (Stage 5)
            {
                "title": "Instant Roasted Coconut Chutney Powder Launch",
                "post_type": "image",
                "platforms": ["instagram", "facebook"],
                "status": "client_review",
                "priority": "urgent",
                "primary_caption": "Missing the nostalgic taste of Amma's Thenga Chutney? Just add a splash of warm water and enjoy the authentic roasted aroma.",
                "hashtags": "#CoconutChutney #KeralaBreakfast #VJFoodsInstant #AuthenticFlavors",
                "location": "Kochi",
                "media_urls": ["https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80"],
                "checklist": [{"task": "Team QA approved", "done": True}, {"task": "Awaiting client sign-off", "done": False}]
            },
            # 6. Approved / Post Schedule (Stage 6)
            {
                "title": "Sunday Special Chettinad Chicken Masala Guide",
                "post_type": "carousel",
                "platforms": ["instagram", "facebook"],
                "status": "scheduled",
                "priority": "high",
                "primary_caption": "Fiery, aromatic, and deeply satisfying. Elevate your Sunday feast with our freshly packed Chettinad Spice Blend.",
                "scheduled_at": now + timedelta(days=1, hours=6),
                "hashtags": "#ChettinadCurry #SundayFeast #VJFoodsKitchen #KeralaFoodie",
                "media_urls": ["https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80"],
                "checklist": [{"task": "Client approved on portal", "done": True}, {"task": "Scheduled in Meta Queue", "done": True}]
            },
            # 7. Published / Posted (Stage 7)
            {
                "title": "25 Years of Purity & Tradition - Thank You Kerala!",
                "post_type": "image",
                "platforms": ["instagram", "facebook", "linkedin"],
                "status": "published",
                "priority": "medium",
                "primary_caption": "From a small family kitchen to dining tables across the globe, thank you for trusting V J Foods for over 25 years of pure culinary excellence.",
                "published_at": now - timedelta(days=2),
                "hashtags": "#25YearsOfTrust #VJFoodsHeritage #TasteOfKerala #PureTradition",
                "location": "Kerala",
                "media_urls": ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80"],
                "analytics": {"reach": 24800, "impressions": 38200, "likes": 2150, "shares": 310, "comments": 142}
            }
        ]

        for p_info in vj_posts:
            p, created = SocialPost.objects.update_or_create(
                client_profile=vj_profile,
                title=p_info["title"],
                defaults={
                    **p_info,
                    "created_by": admin_user,
                    "assigned_to": admin_user,
                }
            )
            print(f"   -> [{p.status}] {p.title}")

    # 2. Add posts across stages for Adstra Digital and Vorion Nexus too
    for profile in [adstra_profile, vorion_profile]:
        if not profile:
            continue
        print(f"[+] Ensuring all 7 stages populated for {profile.name}...")

        is_adstra = "Adstra" in profile.name
        sample_posts = [
            {
                "title": f"{profile.name}: Strategic Growth Playbook 2026",
                "post_type": "carousel",
                "platforms": ["linkedin", "instagram"],
                "status": "script",
                "priority": "high",
                "primary_caption": "Why standard marketing funnels underperform in modern algorithmic feeds.",
                "script_notes": "Hook: 90% of marketing advice online ignores attribution breakdown.\nCTA: Swipe through for the full framework.",
                "media_urls": ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80"]
            },
            {
                "title": f"{profile.name}: Client Case Study - 4.2x ROI",
                "post_type": "video",
                "platforms": ["linkedin", "youtube"],
                "status": "script_approval",
                "priority": "medium",
                "primary_caption": "Deep-dive case study showing how data-driven creatives scaled sales in 60 days.",
                "script_notes": "Awaiting final approval before video shoot.",
                "media_urls": ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80"]
            },
            {
                "title": f"{profile.name}: Visual Identity & Typography Refresh",
                "post_type": "image",
                "platforms": ["instagram"],
                "status": "designing",
                "priority": "high",
                "primary_caption": "Design should communicate before reading. Sneak peek into our updated design language.",
                "designer_notes": "Typography grid in Figma. Use primary branding palette.",
                "media_urls": ["https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80"]
            },
            {
                "title": f"{profile.name}: Team Culture & Innovation Friday",
                "post_type": "reel",
                "platforms": ["instagram", "linkedin"],
                "status": "team_review",
                "priority": "low",
                "primary_caption": "Behind the scenes with our engineering & design squad pushing creative boundaries.",
                "media_urls": ["https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80"]
            },
            {
                "title": f"{profile.name}: Quarterly Performance Review Highlights",
                "post_type": "carousel",
                "platforms": ["linkedin"],
                "status": "client_review",
                "priority": "urgent",
                "primary_caption": "Key milestones, reach surges, and revenue conversions unlocked this quarter.",
                "media_urls": ["https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80"]
            },
            {
                "title": f"{profile.name}: Upcoming Webinar on Digital Transformation",
                "post_type": "image",
                "platforms": ["linkedin", "facebook", "instagram"],
                "status": "scheduled",
                "priority": "high",
                "scheduled_at": now + timedelta(days=2),
                "primary_caption": "Join us live this Thursday for an interactive discussion on omnichannel customer journeys.",
                "media_urls": ["https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"]
            }
        ]

        for p_info in sample_posts:
            p, _ = SocialPost.objects.update_or_create(
                client_profile=profile,
                title=p_info["title"],
                defaults={
                    **p_info,
                    "created_by": admin_user,
                    "assigned_to": admin_user,
                }
            )
            print(f"   -> [{p.status}] {p.title}")

    print("[SUCCESS] All 7 sections now populated with rich dummy data!")

if __name__ == "__main__":
    run_seed()

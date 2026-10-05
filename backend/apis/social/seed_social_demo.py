"""
Demo data for the Social Media CRM.

Run from /backend:
    venv\\Scripts\\python.exe apis\\social\\seed_social_demo.py            # add/refresh demo data
    venv\\Scripts\\python.exe apis\\social\\seed_social_demo.py --reset    # wipe demo clients first

Everything is tagged by the client slugs "demo-*" so --reset only removes demo data.
"""
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from datetime import timedelta
from decimal import Decimal

from django.utils import timezone

from apis.user.models import CustomUser
from apis.social.models import (
    SocialClientProfile, SocialAccount, SocialCampaign, SocialMediaAsset, SocialPost,
    PostApprovalHistory, SocialInboxMessage, SocialDailyAnalytics,
    CampaignPlatform, CampaignMetricSnapshot, CampaignActivity,
)

IMG = "https://images.unsplash.com/photo-%s?w=800&auto=format&fit=crop&q=80"
PICS = [IMG % x for x in (
    "1551288049-bebda4e38f71", "1460925895917-afdab827c52f", "1533750516457-a7f992034fec",
    "1542744094-3a31f272c490", "1611162617474-5b21e879e113", "1497366216548-37526070297c",
)]


def seed():
    now = timezone.now()
    today = now.date()
    user = CustomUser.objects.filter(role__in=['super_admin', 'admin']).first() or CustomUser.objects.first()
    actor = getattr(user, 'fullname', '') or 'Demo Admin'

    if '--reset' in sys.argv:
        n = SocialClientProfile.objects.filter(slug__startswith='demo-').delete()
        print(f"[reset] removed: {n}")

    # ---- Clients ----
    clients_def = [
        dict(slug='demo-coastal-cafe', name='Coastal Cafe', tagline='Fresh brews, sea breeze', color='#0ea5e9',
             tier='Growth Package', policy='client_required', industry='Food & Beverage', posts=20),
        dict(slug='demo-glowup-clinic', name='GlowUp Skin Clinic', tagline='Confidence, clinically proven', color='#ec4899',
             tier='Premium Package', policy='client_required', industry='Healthcare', posts=24),
        dict(slug='demo-urbanfit', name='UrbanFit Gym', tagline='Train. Transform. Repeat.', color='#10b981',
             tier='Starter Package', policy='internal_only', industry='Fitness', posts=12),
    ]
    clients = {}
    for c in clients_def:
        clients[c['slug']], _ = SocialClientProfile.objects.update_or_create(
            slug=c['slug'],
            defaults=dict(
                name=c['name'], brand_tagline=c['tagline'], primary_color=c['color'], package_tier=c['tier'],
                approval_policy=c['policy'], industry=c['industry'], target_monthly_posts=c['posts'],
                client_email=f"{c['slug']}@example.com", client_contact="+91 90000 00000",
                brand_tone="Friendly, confident", is_active=True,
                notes="DEMO DATA - safe to delete (python seed_social_demo.py --reset).",
            ),
        )

    # ---- Accounts ----
    acc_def = {
        'demo-coastal-cafe': [('instagram', '@coastalcafe', 8200, 'connected', 80), ('facebook', 'Coastal Cafe', 5100, 'token_expiring', 3)],
        'demo-glowup-clinic': [('instagram', '@glowupclinic', 15400, 'connected', 70), ('youtube', 'GlowUp TV', 4300, 'connected', 100),
                               ('google_business', 'GlowUp Clinic', 900, 'expired', -2)],
        'demo-urbanfit': [('instagram', '@urbanfit.gym', 6700, 'connected', 60), ('x', '@urbanfit', 1200, 'disconnected', 0)],
    }
    accounts = {}
    for slug, rows in acc_def.items():
        for platform, uname, followers, status, days in rows:
            accounts[(slug, platform)], _ = SocialAccount.objects.update_or_create(
                client_profile=clients[slug], account_id=f"{slug}-{platform}",
                defaults=dict(platform=platform, account_name=uname, username=uname, status=status,
                              followers_count=followers, token_expiry=now + timedelta(days=days)),
            )

    # ---- Media ----
    for i, slug in enumerate(clients):
        for j, (t, kind) in enumerate([("Hero Banner", 'image'), ("Brand Logo", 'logo'), ("Promo Reel", 'reel')]):
            SocialMediaAsset.objects.get_or_create(
                client_profile=clients[slug], title=f"{clients[slug].name} - {t}",
                defaults=dict(asset_type=kind, file_url=PICS[(i + j) % len(PICS)], folder='Creatives' if kind != 'logo' else 'Logos',
                              file_format='MP4' if kind == 'reel' else 'PNG', file_size_bytes=900000 * (j + 1),
                              tags=['demo', kind], uploaded_by=user),
            )

    # ---- Campaigns (with per-day Meta metrics so Reports tab has charts) ----
    camp_def = [
        ('demo-coastal-cafe', 'Summer Cold Brew Launch', 'conversions', 30000, 18200, 'active', 'meta'),
        ('demo-glowup-clinic', 'Free Skin Consultation Leads', 'lead_generation', 60000, 41000, 'active', 'meta'),
        ('demo-glowup-clinic', 'Monsoon Glow Awareness', 'brand_awareness', 25000, 25000, 'completed', 'meta'),
        ('demo-urbanfit', 'New Year Membership Drive', 'lead_generation', 20000, 4500, 'paused', 'meta'),
        ('demo-coastal-cafe', 'Weekend Brunch Promo (draft)', 'traffic', 10000, 0, 'draft', 'meta'),
    ]
    campaigns = {}
    for slug, name, obj, budget, spent, status, plat in camp_def:
        camp, _ = SocialCampaign.objects.update_or_create(
            client_profile=clients[slug], name=name,
            defaults=dict(objective=obj, budget=Decimal(budget), spent=Decimal(spent), status=status,
                          start_date=today - timedelta(days=30), end_date=today + timedelta(days=15),
                          platforms=['instagram', 'facebook'], ad_platforms=[plat], target_audience="Kerala, 18-45",
                          target_locations=['Kochi', 'Calicut'], target_age_min=18, target_age_max=45,
                          cta='contact_us' if obj == 'lead_generation' else 'learn_more',
                          headline=name, primary_text=f"{name} - limited time offer!", landing_page_url="https://example.com"),
        )
        campaigns[name] = camp
        if status == 'draft':
            continue
        cp, _ = CampaignPlatform.objects.update_or_create(
            campaign=camp, platform=plat,
            defaults=dict(publish_status='published', status='active' if status == 'active' else status if status in ('paused', 'completed') else 'draft',
                          platform_campaign_id=f"demo_{camp.id}", meta_campaign_id=f"demo_{camp.id}", last_synced_at=now),
        )
        daily = float(spent) / 30
        for d in range(30, -1, -1):
            imp = 3000 + (d * 173) % 2500
            clicks = int(imp * (0.018 + (d % 5) * 0.003))
            leads = (d % 3) + (1 if obj == 'lead_generation' else 0)
            sp = round(daily * (0.8 + (d % 4) * 0.1), 2)
            CampaignMetricSnapshot.objects.update_or_create(
                campaign_platform=cp, date=today - timedelta(days=d),
                defaults=dict(spend=sp, impressions=imp, reach=int(imp * 0.8), clicks=clicks, leads=leads,
                              conversions=leads // 2, ctr=round(clicks / imp * 100, 2),
                              cpc=round(sp / max(clicks, 1), 4), cpl=round(sp / max(leads, 1), 2)),
            )
        if not camp.activities.exists():
            CampaignActivity.objects.create(campaign=camp, platform=plat, action='Campaign published', message='Demo seed')

    # ---- Posts: at least one per workflow stage ----
    cafe, clinic, gym = clients['demo-coastal-cafe'], clients['demo-glowup-clinic'], clients['demo-urbanfit']
    posts_def = [
        # (client, title, type, platforms, status, priority, offset_days, camp, extra)
        (cafe, "Cold Brew Reel - Hook Ideas", 'reel', ['instagram'], 'script', 'high', 5, 'Summer Cold Brew Launch',
         dict(script_notes="Hook: 'Your 3pm slump called.' Show pour shot, 15s.")),
        (gym, "5 Mistakes Beginners Make", 'carousel', ['instagram'], 'script', 'medium', 6, None,
         dict(script_notes="5 slides, bold text, CTA free trial.")),
        (clinic, "Skin Barrier 101", 'carousel', ['instagram', 'youtube'], 'script_approval', 'high', 4, 'Free Skin Consultation Leads',
         dict(script_notes="Educational carousel, dermatologist quote.")),
        (cafe, "Weekend Brunch Menu", 'image', ['instagram', 'facebook'], 'designing', 'medium', 3, 'Weekend Brunch Promo (draft)',
         dict(script_notes="Menu highlight", designer_notes="Warm tones, serif headline, logo bottom-right.")),
        (clinic, "Before/After Testimonial", 'image', ['instagram'], 'team_review', 'urgent', 2, 'Free Skin Consultation Leads',
         dict(primary_caption="Real results, real confidence. Book your free consult today!", hashtags="#GlowUp #SkinCare",
              media_urls=[PICS[0]])),
        (clinic, "Monsoon Skincare Tips", 'video', ['instagram', 'youtube'], 'client_review', 'high', 2, 'Monsoon Glow Awareness',
         dict(primary_caption="3 monsoon skin rules you must follow.", hashtags="#Monsoon #Skin", media_urls=[PICS[2]],
              client_feedback="")),
        (cafe, "Cold Brew Launch Day", 'image', ['instagram', 'facebook'], 'approved', 'high', 1, 'Summer Cold Brew Launch',
         dict(primary_caption="Cold brew is HERE. First 50 guests get a free cup!", hashtags="#ColdBrew #Kochi", media_urls=[PICS[1]])),
        (gym, "Member Transformation Story", 'reel', ['instagram'], 'approved', 'medium', 2, None,
         dict(primary_caption="12 weeks. One goal. Meet Arun.", media_urls=[PICS[2]])),
        (cafe, "Grand Opening Anniversary", 'image', ['instagram', 'facebook'], 'published', 'medium', -4, None,
         dict(primary_caption="One year of great coffee. Thank you!", media_urls=[PICS[3]],
              analytics={'likes': 412, 'comments': 38, 'reach': 9800})),
        (clinic, "Laser Treatment FAQ", 'carousel', ['instagram'], 'published', 'low', -9, None,
         dict(primary_caption="Your laser questions, answered.", media_urls=[PICS[0]],
              analytics={'likes': 640, 'comments': 71, 'reach': 15200})),
        (gym, "Old Promo Poster", 'image', ['instagram'], 'archived', 'low', -30, None, dict(primary_caption="Expired offer.")),
        (clinic, "Rejected: Too Salesy Caption", 'image', ['instagram'], 'rejected', 'medium', 3, None,
         dict(primary_caption="BUY NOW!!!", client_feedback="Tone is too pushy, please soften.")),
    ]
    for client, title, ptype, plats, status, prio, off, camp_name, extra in posts_def:
        sched = now + timedelta(days=off, hours=3)
        post, created = SocialPost.objects.update_or_create(
            client_profile=client, title=title,
            defaults=dict(post_type=ptype, platforms=plats, status=status, priority=prio, scheduled_at=sched,
                          published_at=sched if status == 'published' else None,
                          campaign=campaigns.get(camp_name) if camp_name else None,
                          created_by=user, assigned_to=user,
                          checklist=[{"task": "Caption proofread", "done": status in ('approved', 'published')}],
                          **extra),
        )
        if created:
            PostApprovalHistory.objects.create(post=post, action='created', actor_name=actor, actor_role='Strategist', notes='Demo post created')
            if status in ('approved', 'published'):
                PostApprovalHistory.objects.create(post=post, action='approved', actor_name='Client', actor_role='Approver', notes='Approved')

    # ---- Inbox ----
    inbox = [
        (cafe, 'instagram', 'dm', "Meera Nair", "meera.n", "Do you take bulk orders for office events? Need 40 cold brews on Friday.", 'pending', True),
        (cafe, 'facebook', 'comment', "Joseph T", "joseph.t", "Loved the new menu! Is the brunch available on Sundays?", 'pending', False),
        (clinic, 'instagram', 'dm', "Fathima R", "fathi_r", "How much is the laser hair removal package? Please share details.", 'important', True),
        (clinic, 'instagram', 'lead_ad', "Sneha P", "", "Lead form: Free consultation - Phone 98950 11122", 'pending', True),
        (clinic, 'youtube', 'comment', "Anand K", "anand_k", "Great video, very helpful!", 'resolved', False),
        (gym, 'instagram', 'dm', "Rohit S", "rohit.fit", "What are your membership rates? Any student discount?", 'pending', True),
        (gym, 'x', 'mention', "FitKerala", "fitkerala", "Shoutout to @urbanfit for the best trainers in town!", 'resolved', False),
    ]
    for client, plat, mtype, name, handle, text, status, lead in inbox:
        SocialInboxMessage.objects.get_or_create(
            client_profile=client, sender_name=name, message_text=text,
            defaults=dict(platform=plat, message_type=mtype, sender_handle=handle, status=status, is_lead=lead,
                          sender_phone="+91 98950 11122" if lead else "",
                          replies=[{"sender": "Team", "text": "Thanks for reaching out!", "timestamp": now.isoformat()}] if status == 'resolved' else []),
        )

    # ---- Daily analytics (30d) ----
    for slug, plat, base in [('demo-coastal-cafe', 'instagram', 8000), ('demo-glowup-clinic', 'instagram', 15000), ('demo-urbanfit', 'instagram', 6500)]:
        for i in range(30, -1, -1):
            SocialDailyAnalytics.objects.update_or_create(
                client_profile=clients[slug], date=today - timedelta(days=i), platform=plat,
                defaults=dict(account=accounts.get((slug, plat)), followers=base + (30 - i) * 12, follower_change=12 + i % 5,
                              reach=2000 + (i * 131) % 1800, impressions=3500 + (i * 197) % 2600,
                              engagement_rate=round(4.2 + (i % 5) * 0.4, 2), likes=90 + i * 2, comments=10 + i % 7,
                              shares=6 + i % 5, saves=14 + i % 9, posts_published=1 if i % 3 == 0 else 0,
                              leads_generated=2 if i % 5 == 0 else 0),
            )

    print("[OK] Demo data seeded: 3 clients, accounts, campaigns+metrics, posts in every stage, inbox, analytics.")


if __name__ == "__main__":
    seed()

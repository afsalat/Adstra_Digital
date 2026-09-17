import os
import random
from datetime import datetime, time
from django.utils import timezone
from apis.social.models import (
    SocialPost,
    PostApprovalHistory,
    SocialInboxMessage,
    SocialClientProfile,
)
from apis.leads.models import Lead, generate_lead_number


def convert_inbox_to_crm_lead(inbox_message, user=None, custom_data=None):
    custom_data = custom_data or {}
    platform_name = inbox_message.platform.title()
    source_str = f"Social Media - {platform_name}"
    
    # Check if client has linked CRM client
    crm_client = inbox_message.client_profile.client

    customer_name = custom_data.get('customer_name') or inbox_message.sender_name
    phone = custom_data.get('phone') or inbox_message.sender_phone
    email = custom_data.get('email', '')
    context_str = inbox_message.post_context or inbox_message.platform
    product_interest = custom_data.get('product') or f"Enquiry via {context_str}"
    
    handle_info = f"Captured from {inbox_message.platform.upper()} handle: @{inbox_message.sender_handle}" if inbox_message.sender_handle else ""

    lead = Lead.objects.create(
        customer=crm_client,
        customer_name=customer_name,
        contact_person=customer_name,
        phone=phone,
        email=email,
        source=source_str,
        campaign=inbox_message.post_context or f"{inbox_message.client_profile.name} Campaign",
        product=product_interest,
        address=handle_info,
        current_stage='NEW',
        temperature='WARM' if inbox_message.sender_phone else 'COLD',
        priority='HIGH' if inbox_message.sender_phone else 'MEDIUM',
    )

    inbox_message.is_lead = True
    inbox_message.converted_lead = lead
    inbox_message.status = 'resolved'
    inbox_message.save(update_fields=['is_lead', 'converted_lead', 'status'])

    return lead


def record_approval_action(post, action, actor_name, actor_role='Team', notes=''):
    PostApprovalHistory.objects.create(
        post=post,
        action=action,
        actor_name=actor_name,
        actor_role=actor_role,
        notes=notes,
    )


def generate_ai_content(prompt, tone='Professional', language='en', platform='instagram', content_type='caption'):
    """
    AI assistant with multilingual (Malayalam and English) support,
    hashtag generation, tone selection, and content hooks.
    """
    keywords = [w.strip() for w in prompt.split() if len(w.strip()) > 3]
    main_kw = keywords[0].capitalize() if keywords else 'Brand'

    tones = {
        'Professional': {
            'prefix_en': 'Transform your growth strategy with precision.',
            'prefix_ml': 'നിങ്ങളുടെ ബിസിനസ്സ് വളർച്ചയെ അടുത്ത തലത്തിലേക്ക് ഉയർത്തൂ.',
            'cta_en': 'Connect with our team to elevate your business today. Link in bio.',
            'cta_ml': 'കൂടുതൽ വിവരങ്ങൾക്കും കൺസൾട്ടേഷനുമായി ഞങ്ങളുമായി ബന്ധപ്പെടൂ. Link in bio.'
        },
        'Punchy/Viral': {
            'prefix_en': 'Stop scrolling! Here is what top brands do differently in marketing:',
            'prefix_ml': 'ശ്രദ്ധിക്കൂ! ബിസിനസ്സ് മാർക്കറ്റിംഗിൽ നിങ്ങൾ ഈ തെറ്റുകൾ വരുത്തുന്നുണ്ടോ?',
            'cta_en': 'Drop a message or comment below if you want the exact growth blueprint!',
            'cta_ml': 'കൂടുതൽ അറിയാൻ താഴെ കമൻ്റ് ചെയ്യൂ! സേവ് ചെയ്ത് വെക്കാൻ മറക്കല്ലേ.'
        },
        'Festive': {
            'prefix_en': 'Wishing you and your family prosperous moments filled with celebration!',
            'prefix_ml': 'സന്തോഷവും ഐശ്വര്യവും നിറഞ്ഞ ആശംസകൾ നേരുന്നു!',
            'cta_en': 'Celebrate success with exclusive festive benefits this season.',
            'cta_ml': 'ഈ ഉത്സവകാലം കൂടുതൽ മനോഹരമാക്കാൻ ഞങ്ങളുടെ പ്രത്യേക ഓഫറുകൾ പ്രയോജനപ്പെടുത്തൂ.'
        },
        'Storytelling': {
            'prefix_en': 'Every great breakthrough begins with a single decisive step.',
            'prefix_ml': 'ഓരോ വലിയ വിജയത്തിന് പിന്നിലും ധീരമായ ഒരു തുടക്കമുണ്ട്.',
            'cta_en': 'Read the full journey on our website. What inspired your journey today?',
            'cta_ml': 'നിങ്ങളുടെ സംരംഭക സ്വപ്നങ്ങൾക്ക് ചിറകേകാൻ ഞങ്ങൾ തയ്യാറാണ്.'
        }
    }

    t_data = tones.get(tone, tones['Professional'])

    if language == 'ml':
        caption = f"{t_data['prefix_ml']}\n\n{prompt}\n\nമികച്ച ഡിജിറ്റൽ സ്ട്രാറ്റജികൾ വഴി ഉപഭോക്താക്കളിലേക്ക് വേഗത്തിൽ എത്തിച്ചേരൂ. ഞങ്ങളുടെ ക്രിയേറ്റീവ് സൊല്യൂഷനുകൾ നിങ്ങളുടെ ബ്രാൻഡിനെ മുൻപന്തിയിലെത്തിക്കുന്നു.\n\n{t_data['cta_ml']}"
    elif language == 'both':
        caption = f"{t_data['prefix_en']}\n\n{prompt}\n\n{t_data['prefix_ml']}\n\n{t_data['cta_en']}\n{t_data['cta_ml']}"
    else:
        caption = f"{t_data['prefix_en']}\n\n{prompt}\n\nIn todays dynamic market, scaling requires clarity, consistency, and intelligent digital presence. We deliver data-backed creative excellence tailored to your audience.\n\n{t_data['cta_en']}"

    # Generate hashtags
    base_hashtags = ['#AdstraDigital', '#DigitalMarketing', '#BrandGrowth', '#BusinessStrategy', '#MarketingTips']
    if keywords:
        for kw in keywords[:3]:
            base_hashtags.append(f"#{kw.replace(' ', '')}")
    if language in ['ml', 'both']:
        base_hashtags.extend(['#KeralaBusiness', '#MalayalamMarketing', '#KeralaStartups', '#EntrepreneursOfKerala'])

    hashtags = ' '.join(list(dict.fromkeys(base_hashtags)))

    best_times = [
        {'day': 'Monday', 'time': '10:30 AM', 'reason': 'High LinkedIn and B2B engagement'},
        {'day': 'Wednesday', 'time': '01:00 PM', 'reason': 'Peak Instagram lunchtime browse'},
        {'day': 'Friday', 'time': '07:30 PM', 'reason': 'Weekend mood & high carousel engagement'},
        {'day': 'Sunday', 'time': '08:00 PM', 'reason': 'Evening leisure catch-up'},
    ]

    return {
        'caption': caption,
        'hashtags': hashtags,
        'best_posting_times': best_times,
        'suggested_hook': t_data['prefix_ml'] if language == 'ml' else t_data['prefix_en'],
        'language': language,
        'tone': tone,
    }


CLIENT_PALETTE = [
    '#4f46e5', '#0ea5e9', '#ec4899', '#8b5cf6', '#10b981',
    '#f59e0b', '#06b6d4', '#f43f5e', '#6366f1', '#14b8a6',
    '#3b82f6', '#84cc16', '#d946ef', '#e11d48', '#0284c7',
]


def sync_proposal_clients():
    """Ensure every Client Company from proposal.Client has a corresponding SocialClientProfile."""
    from apis.proposal.models import Client as ProposalClient
    from django.utils.text import slugify

    for idx, c in enumerate(ProposalClient.objects.all().order_by('id')):
        display_name = (c.company_name or c.name or f"Client Company {c.id}").strip()
        if display_name.lower() == 'adstra_digital':
            display_name = 'Adstra Digital'

        profile = SocialClientProfile.objects.filter(client=c).first()
        if not profile:
            candidate_slug = slugify(display_name) or f"client-{c.id}"
            profile = SocialClientProfile.objects.filter(slug=candidate_slug).first()
            if profile:
                profile.client = c
                profile.name = display_name
                profile.save(update_fields=['client', 'name'])
            else:
                slug = candidate_slug
                counter = 1
                while SocialClientProfile.objects.filter(slug=slug).exists():
                    slug = f"{candidate_slug}-{counter}"
                    counter += 1
                color = CLIENT_PALETTE[idx % len(CLIENT_PALETTE)]
                SocialClientProfile.objects.create(
                    client=c,
                    name=display_name,
                    slug=slug,
                    primary_color=color,
                    client_email=c.email or '',
                    client_contact=c.contact or '',
                    is_active=True,
                    notes=f"Synced from Client Companies table (ID #{c.id})",
                )
        else:
            if profile.name != display_name and display_name:
                profile.name = display_name
                profile.save(update_fields=['name'])


import os
import django
import random
from decimal import Decimal
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from apis.leads.models import (
    TargetCustomerList,
    TargetCustomer,
    Lead,
    LeadActivity,
    LeadFollowUp,
    LeadMeeting,
    ProductDemo,
    ServiceRequirement,
    EmailTemplate
)

User = get_user_model()

def seed_data():
    print("Starting database seeding...")
    
    # 1. Get users
    users = list(User.objects.all())
    if not users:
        print("Error: No users found in the database. Please create users first.")
        return
    
    super_admin = User.objects.filter(role="super_admin").first() or users[0]
    
    # 2. Clean existing Lead-related tables
    print("Cleaning existing lead-related tables...")
    LeadActivity.objects.all().delete()
    LeadFollowUp.objects.all().delete()
    LeadMeeting.objects.all().delete()
    ProductDemo.objects.all().delete()
    ServiceRequirement.objects.all().delete()
    Lead.objects.all().delete()
    TargetCustomer.objects.all().delete()
    TargetCustomerList.objects.all().delete()
    EmailTemplate.objects.all().delete()
    
    # 3. Create Email Templates
    print("Creating Email Templates...")
    templates_data = [
        {
            "name": "Introduction Email",
            "subject": "Introduction to Adstra Digital Services",
            "body": "Hello {{contact_person}},\n\nI hope this email finds you well. I am writing to introduce Adstra Digital, a premier provider of technology and marketing services. We would love to discuss how we can help {{company_name}} grow.\n\nBest regards,\nAdstra Team",
            "is_default": True
        },
        {
            "name": "Follow Up Template",
            "subject": "Checking in regarding our recent discussion",
            "body": "Hi {{contact_person}},\n\nJust wanted to follow up on our previous conversation regarding {{service}}. Please let me know when you might have 10 minutes to sync.\n\nBest regards,\nAdstra Team",
            "is_default": False
        },
        {
            "name": "Meeting Thank You",
            "subject": "Thank you for your time today",
            "body": "Dear {{contact_person}},\n\nThank you for taking the time to speak with us today about {{company_name}}'s requirements. We are preparing the cost estimate and will share it shortly.\n\nBest regards,\nAdstra Team",
            "is_default": False
        }
    ]
    for td in templates_data:
        EmailTemplate.objects.create(**td)
        
    # 4. Create Target Customer Lists
    print("Creating Target Customer Lists...")
    list1 = TargetCustomerList.objects.create(
        name="Q3 Enterprise Solutions Campaign",
        description="Outreach to major retail and logistics firms in metropolitan hubs",
        campaign="Retail Enterprise Q3",
        source="LinkedIn Sales Navigator",
        assigned_team="Enterprise Sales",
        created_by=super_admin,
        status="ACTIVE"
    )
    list2 = TargetCustomerList.objects.create(
        name="Inbound Website Queries",
        description="Leads gathered from organic contact forms and landing pages",
        campaign="Organic Inbound 2026",
        source="Website",
        assigned_team="Inbound Sales",
        created_by=super_admin,
        status="ACTIVE"
    )
    
    # 5. Create Target Customers
    print("Creating Target Customers...")
    customers_data = [
        # List 1
        ("Acme Retail Corp", "Alice Smith", "+14155552671", "alice@acme.com", "Retail", "CRM Integration", list1),
        ("Apex Logistics", "Bob Jones", "+15105553892", "bob@apex.com", "Logistics", "Fleet Management App", list1),
        ("Global Warehousing", "Carol Davis", "+16505559021", "carol@globalwh.com", "Logistics", "Cloud Infrastructure Setup", list1),
        ("Zenith E-Commerce", "David Miller", "+919876543210", "david@zenith.in", "Retail", "Shopify Customization", list1),
        ("Blue Horizon Retail", "Eva Green", "+919988776655", "eva@bluehorizon.com", "Retail", "Inventory Optimization", list1),
        # List 2
        ("Silverline Tech", "Frank Wright", "+12065551982", "frank@silverline.com", "Technology", "UI/UX Design", list2),
        ("Pinnacle Finance", "Grace Hopper", "+14255558117", "grace@pinnacle.com", "Finance", "Mobile App Development", list2),
        ("Stellar Foods", "Henry Ford", "+919888777666", "henry@stellarfoods.com", "Food & Beverage", "Digital Marketing", list2),
        ("Vortex Logistics", "Ivy Chen", "+918887776665", "ivy@vortex.com", "Logistics", "Supply Chain Dashboard", list2),
        ("Omega Health", "Jack Ryan", "+16175554329", "jack@omegahealth.com", "Healthcare", "Patient Portal Website", list2),
    ]
    
    target_customers = []
    for company, contact, phone, email, industry, offering, tc_list in customers_data:
        tc = TargetCustomer.objects.create(
            customer_list=tc_list,
            customer_name=contact,
            company_name=company,
            contact_person=contact,
            phone=phone,
            whatsapp_number=phone,
            email=email,
            industry=industry,
            interested_service=offering,
            priority=random.choice(["LOW", "MEDIUM", "HIGH", "URGENT"]),
            assigned_to=random.choice(users),
            notes=f"Interested in custom {offering} solutions."
        )
        target_customers.append(tc)

    # 6. Create Leads
    print("Creating Leads...")
    leads_configs = [
        # (Company, Contact, Phone, Email, Service/Product, Stage, Priority, Temperature, Assigned User, List)
        ("Acme Retail Corp", "Alice Smith", "+14155552671", "alice@acme.com", "CRM Integration", "NEW", "HIGH", "HOT", 0),
        ("Apex Logistics", "Bob Jones", "+15105553892", "bob@apex.com", "Fleet Management App", "ASSIGNED", "HIGH", "HOT", 1),
        ("Global Warehousing", "Carol Davis", "+16505559021", "carol@globalwh.com", "Cloud Infrastructure Setup", "CONTACT_ATTEMPTED", "MEDIUM", "WARM", 2),
        ("Zenith E-Commerce", "David Miller", "+919876543210", "david@zenith.in", "Shopify Customization", "CONNECTED", "URGENT", "HOT", 3),
        ("Blue Horizon Retail", "Eva Green", "+919988776655", "eva@bluehorizon.com", "Inventory Optimization", "QUALIFIED", "MEDIUM", "WARM", 4),
        ("Silverline Tech", "Frank Wright", "+12065551982", "frank@silverline.com", "UI/UX Design", "NEGOTIATION", "HIGH", "HOT", 5),
        ("Pinnacle Finance", "Grace Hopper", "+14255558117", "grace@pinnacle.com", "Mobile App Development", "CONVERTED", "URGENT", "HOT", 6),
        ("Stellar Foods", "Henry Ford", "+919888777666", "henry@stellarfoods.com", "Digital Marketing", "REJECTED", "LOW", "COLD", 7),
        ("Vortex Logistics", "Ivy Chen", "+918887776665", "ivy@vortex.com", "Supply Chain Dashboard", "ON_HOLD", "MEDIUM", "WARM", 8),
        ("Omega Health", "Jack Ryan", "+16175554329", "jack@omegahealth.com", "Patient Portal Website", "NEW", "LOW", "COLD", 9),
    ]

    leads = []
    now = timezone.now()
    
    for idx, (company, contact, phone, email, offering, stage, priority, temp, u_idx) in enumerate(leads_configs):
        assigned_user = users[u_idx % len(users)]
        tc = target_customers[idx % len(target_customers)]
        
        lead = Lead(
            target_customer=tc,
            lead_type="SERVICE",
            customer_name=contact,
            company_name=company,
            contact_person=contact,
            phone=phone,
            whatsapp_number=phone,
            email=email,
            service=offering,
            priority=priority,
            temperature=temp,
            assigned_to=assigned_user,
            assigned_by=super_admin,
            lead_score=random.randint(10, 95),
            estimated_value=Decimal(random.randint(5000, 50000)),
            conversion_probability=random.randint(10, 90),
            created_by=super_admin,
            next_follow_up_at=now + timedelta(days=random.randint(1, 10)),
            last_activity_at=now - timedelta(hours=random.randint(1, 48))
        )
        # Bypass initial stage validation checks on Lead.save() for seeding
        lead._workflow_initial_stage = True
        lead.save()
        leads.append(lead)
        
        # Manually save the desired stage as workflow transitions
        lead._save_workflow_stage(stage)

        # 7. Create Activities, FollowUps, and Meetings for each lead
        print(f"Creating activities, meetings and follow-ups for lead: {company}...")
        
        # Activity 1: Created
        LeadActivity.objects.create(
            lead=lead,
            activity_type="SYSTEM",
            title="Lead Created",
            description=f"Lead auto-generated from target customer: {company}",
            actor=super_admin
        )
        
        # Activity 2: Assigned
        LeadActivity.objects.create(
            lead=lead,
            activity_type="SYSTEM",
            title="Lead Assigned",
            description=f"Lead assigned to {assigned_user.username}",
            actor=super_admin
        )
        
        # Activity 3: Custom Note
        LeadActivity.objects.create(
            lead=lead,
            activity_type="NOTE",
            title="Initial Outreach Note",
            description="Discussed high-level requirements. Customer seems interested in custom deployment options.",
            actor=assigned_user
        )

        # Follow-ups (scheduled or completed)
        LeadFollowUp.objects.create(
            lead=lead,
            follow_up_type="PHONE",
            scheduled_at=now + timedelta(days=2),
            assigned_to=assigned_user,
            purpose="Discovery Call",
            notes="Discuss scope, timelines and budgets.",
            status="SCHEDULED",
            created_by=super_admin
        )
        
        # Meetings
        LeadMeeting.objects.create(
            lead=lead,
            title="Requirement Gathering Session",
            meeting_type="SERVICE_REQUIREMENT",
            meeting_mode="ONLINE",
            scheduled_start=now + timedelta(days=3, hours=2),
            scheduled_end=now + timedelta(days=3, hours=3),
            meeting_link="https://meet.google.com/abc-defg-hij",
            assigned_to=assigned_user,
            agenda="Detailed analysis of system capabilities and integration dependencies.",
            status="SCHEDULED",
            created_by=super_admin
        )
        
        # For Qualified / Cost Estimation / Negotiation / Converted stages, add ServiceRequirement
        if stage in {"QUALIFIED", "NEGOTIATION", "CONVERTED"}:
            ServiceRequirement.objects.create(
                lead=lead,
                service=offering,
                business_objective=f"Automate and optimize {offering} operations.",
                current_problem="Inefficient manual processes and data silo issues.",
                required_solution=f"Deploy a robust, modern {offering} system integrated with existing systems.",
                estimated_budget=Decimal(random.randint(15000, 75000)),
                expected_start_date=timezone.localdate(now + timedelta(days=15)),
                expected_completion_date=timezone.localdate(now + timedelta(days=90)),
                decision_maker=contact,
                feasibility_status="FEASIBLE",
                requirement_status="APPROVED",
                created_by=assigned_user
            )

    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_data()

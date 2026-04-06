import os
import django
import json
from datetime import datetime, time
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apis.attendance.models import Attendance
from apis.user.models import CustomUser

def populate_afsal_data():
    # Find user Afsal
    user = CustomUser.objects.filter(fullname__icontains='afsal').first()
    if not user:
        print("User 'Afsal' not found. Please check the fullname in CustomUser.")
        return

    print(f"Updating attendance records for user: {user.fullname} ({user.username})")

    data = [
        # December 2025
        {"date": "2025-12-03", "checkin": "09:30 AM", "checkout": "06:15 PM", "report": "AdInvoice database activation completed. Backend activation and frontend integration work progressed. API integration structure was checked and connected. Fixed pending errors in Adstra and Quick Kerala related sections. Hosting and integration verification also completed."},
        {"date": "2025-12-05", "checkin": "09:35 AM", "checkout": "06:40 PM", "report": "Worked on AdInvoice backend setup and frontend setup. Continued full integration between modules and completed API-level testing to verify request and response flow."},
        {"date": "2025-12-08", "checkin": "09:30 AM", "checkout": "07:00 PM", "report": "Handled backend hosting tasks, frontend integration, and completed overall testing for the working modules. Verified system flow after integration."},
        {"date": "2025-12-10", "checkin": "09:40 AM", "checkout": "06:30 PM", "report": "Fixed Agni session-related issues. Worked on AdInvoice hosting and CyberPanel-related setup. Also handled VJ Foods hosting work."},
        {"date": "2025-12-12", "checkin": "09:30 AM", "checkout": "06:20 PM", "report": "Fixed Agni media errors and AdIn   voice integration issues. Also reviewed pending Adstra blog-related tasks and prepared updates."},
        {"date": "2025-12-13", "checkin": "09:35 AM", "checkout": "07:10 PM", "report": "Resolved Tasteio media loading issues and continued Tasteio integration work. Also completed Agni media setup and integration. Carried out full system testing for stability."},
        {"date": "2025-12-15", "checkin": "09:30 AM", "checkout": "06:00 PM", "report": "Updated Adstra blogs. Worked on AdInvoice configuration setup and testing to confirm working flow."},
        {"date": "2025-12-17", "checkin": "09:45 AM", "checkout": "06:30 PM", "report": "Updated Adstra team section. Corrected invoice multi-item issues and revised terms and policy content."},
        {"date": "2025-12-18", "checkin": "09:30 AM", "checkout": "07:00 PM", "report": "Worked on AdInvoice debugging for 500, 401, 400, and 404 errors. Continued payment setup and integration-related work."},
        {"date": "2025-12-19", "checkin": "09:35 AM", "checkout": "06:25 PM", "report": "Fixed Quick Kerala issues. Added new frontend sections in Adstra and updated terms section. Also worked on AdInvoice pricing section updates."},
        {"date": "2025-12-20", "checkin": "09:30 AM", "checkout": "06:40 PM", "report": "Set up Quick Kerala blog and meta tags. Fixed AdInvoice invoice page and dashboard issues for both client and admin. Improved Agni product view with filters and gallery updates."},
        {"date": "2025-12-22", "checkin": "09:35 AM", "checkout": "06:10 PM", "report": "Worked on backend and frontend config fixes in AdInvoice. Improved Quick Kerala meta tag implementation."},
        {"date": "2025-12-23", "checkin": "09:30 AM", "checkout": "07:00 PM", "report": "Added new UI for Super Admin and Client Admin sections. Created new database setup for the latest structure."},
        {"date": "2025-12-24", "checkin": "09:40 AM", "checkout": "06:20 PM", "report": "Optimized Quick Kerala images and videos. Improved JS, CSS, and HTML performance and completed full testing."},
        {"date": "2025-12-26", "checkin": "09:30 AM", "checkout": "06:30 PM", "report": "Added Adstra blogs, fixed Quick Kerala 404 issue, loaded new AdInvoice version, handled VJ Foods uploads, and added payment section changes."},
        {"date": "2025-12-27", "checkin": "09:35 AM", "checkout": "06:45 PM", "report": "Added new blogs for Adstra, continued AdInvoice-related work, and completed functionality testing."},
        {"date": "2025-12-29", "checkin": "09:30 AM", "checkout": "07:00 PM", "report": "Fixed Quick Kerala login errors, added Adstra blogs, updated VJ Foods images, handled Tasteio client changes, and uploaded previous AdInvoice changes."},
        {"date": "2025-12-30", "checkin": "09:35 AM", "checkout": "06:00 PM", "report": "Completed pending testing tasks and fixed Agni Jewellery product view issues."},
        
        # January 2026
        {"date": "2026-01-02", "checkin": "09:30 AM", "checkout": "06:20 PM", "report": "Worked on VJ Foods changes, logo updates, and new product view creation. Fixed Agni approval workflow issues and completed blog updates."},
        {"date": "2026-01-03", "checkin": "09:35 AM", "checkout": "07:00 PM", "report": "Continued VJ Foods changes. Worked on AdInvoice payment gateway integration and fixed data loading and functionality issues."},
        {"date": "2026-01-05", "checkin": "09:30 AM", "checkout": "06:40 PM", "report": "Worked on VJ Foods redesigning and continued payment gateway integration tasks."},
        {"date": "2026-01-06", "checkin": "09:40 AM", "checkout": "06:30 PM", "report": "Continued payment integration and redesigned website icons."},
        {"date": "2026-01-07", "checkin": "09:30 AM", "checkout": "06:50 PM", "report": "Updated VJ Foods sections, implemented client confirmation changes, and prepared AdInvoice demo."},
        {"date": "2026-01-08", "checkin": "09:35 AM", "checkout": "07:10 PM", "report": "Worked on VJ Foods dashboard, Quick Kerala analytics integration, AdInvoice super admin testing, client admin dashboard testing, and Adstra payment data setup."},
        {"date": "2026-01-09", "checkin": "09:30 AM", "checkout": "06:30 PM", "report": "Tested AdInvoice client admin dashboard, continued VJ Foods redesign, handled Adstra payment gateway tasks, and integrated Quick Kerala tracking code."},
        {"date": "2026-01-10", "checkin": "09:45 AM", "checkout": "06:40 PM", "report": "Continued VJ Foods redesign, worked on Adstra payment gateway, integrated Quick Kerala Google code, and improved Agni Jewellery product-related sections."},
        {"date": "2026-01-12", "checkin": "09:30 AM", "checkout": "06:15 PM", "report": "Reviewed and verified AdInvoice, created second-level testing structure, worked on Adstra payment gateway, and created new design for aartees.com."},
        {"date": "2026-01-13", "checkin": "09:35 AM", "checkout": "06:50 PM", "report": "Implemented aartees.com changes, continued Adstra payment gateway integration, and finalized VJ Foods design changes."},
        {"date": "2026-01-14", "checkin": "09:30 AM", "checkout": "06:30 PM", "report": "Continued Adstra payment gateway work and VJ Foods updates."},
        {"date": "2026-01-15", "checkin": "09:35 AM", "checkout": "07:00 PM", "report": "Completed final VJ Foods changes, updated aartees.com, finished AdInvoice final testing and bug fixes, and continued Adstra payment integration."},
        {"date": "2026-01-16", "checkin": "09:30 AM", "checkout": "06:30 PM", "report": "Handled aartees.com client changes, worked on payment and payroll app setup, fixed VJ Foods alignment issues, and continued payroll planning."},
        {"date": "2026-01-17", "checkin": "09:40 AM", "checkout": "06:15 PM", "report": "Updated aartees.com, created payroll milestone sheet, and added Quick Kerala new blogs."},
        {"date": "2026-01-19", "checkin": "09:30 AM", "checkout": "06:45 PM", "report": "Worked on Quick Kerala new webpage, payroll milestone planning, product creation updates, AdInvoice and payroll email setup, and image optimization fixes."},
        {"date": "2026-01-20", "checkin": "09:35 AM", "checkout": "07:00 PM", "report": "Worked on aartees.com dashboard design and development, finalized payroll milestones, handled email setup for AdInvoice and Payroll, and redesigned Adstra dashboard."},
        {"date": "2026-01-21", "checkin": "09:30 AM", "checkout": "06:00 PM", "report": "AdInvoice testing and aartees category redesign."},
        {"date": "2026-01-22", "checkin": "09:35 AM", "checkout": "06:40 PM", "report": "Worked on aartees product view page, subcategory page, contact page, hiring process setup, and backend planning."},
        {"date": "2026-01-23", "checkin": "09:30 AM", "checkout": "06:30 PM", "report": "Handled VJ Foods client changes, fixed Adstra blog errors, updated aartees product listing and contact page, and made minor fixes in Quick Kerala, Tasteio, and Agni."},
        {"date": "2026-01-24", "checkin": "09:40 AM", "checkout": "07:00 PM", "report": "Worked on aartees login and register pages, backend integration planning, product listing, cart and billing page setup, and fixed Adstra blog issues."},
        {"date": "2026-01-27", "checkin": "09:30 AM", "checkout": "06:35 PM", "report": "Worked on SEO for Adstra and Quick Kerala, added products, updated designs, sent interview tasks, and handled blog updates."},
        {"date": "2026-01-28", "checkin": "09:35 AM", "checkout": "06:50 PM", "report": "Continued product adding, design updates, interview process, aartees dashboard work, and measurement section development."},
        {"date": "2026-01-29", "checkin": "09:30 AM", "checkout": "07:05 PM", "report": "Designed aartees dashboard layout and worked on user management, product management, enquiry list, content editor, and order management."},
        {"date": "2026-01-30", "checkin": "09:35 AM", "checkout": "06:25 PM", "report": "Completed aartees pending work, handled frontend and backend hosting, and set up Google Sheet tracking."},
        {"date": "2026-01-31", "checkin": "09:30 AM", "checkout": "06:40 PM", "report": "Worked on aartees measurement saree module, tested all modules, updated Quick Kerala vehicle module, and completed Tasteio logo updates."},
        
        # February 2026
        {"date": "2026-02-01", "checkin": "09:35 AM", "checkout": "06:30 PM", "report": "Integrated aartees order management, enquiry listing, and content editor. Also worked on Adstra blogs."},
        {"date": "2026-02-03", "checkin": "09:30 AM", "checkout": "06:45 PM", "report": "Fixed AdInvoice issues, added new Adstra blogs, implemented VJ Foods changes, and handled aartees client changes."},
        {"date": "2026-02-04", "checkin": "09:40 AM", "checkout": "06:20 PM", "report": "Fixed AdInvoice DB issues, completed pending blogs, handled aartees client and admin tasks, and fixed Adstra pages."},
        {"date": "2026-02-05", "checkin": "09:30 AM", "checkout": "07:00 PM", "report": "Redesigned aartees homepage and header section, worked on Adstra dashboard, and attended Rushikesh Tourism client meeting."},
        {"date": "2026-02-06", "checkin": "09:35 AM", "checkout": "06:30 PM", "report": "Worked on aartees redesign, card updates, UI improvements, and change implementation."},
        {"date": "2026-02-07", "checkin": "09:30 AM", "checkout": "06:50 PM", "report": "Developed checkout functionality, coupon functionality, order tracking, and fixed dashboard errors."},
        {"date": "2026-02-08", "checkin": "09:45 AM", "checkout": "07:00 PM", "report": "Worked on order tracking details, favorite listing, homepage redesign pending items, profile and order error fixes, and animation plus scroll smoothness."},
        {"date": "2026-02-10", "checkin": "09:30 AM", "checkout": "06:20 PM", "report": "Completed aartees pending tasks, fixed Adstra invoice errors, and corrected proposal and receipt issues."},
        {"date": "2026-02-11", "checkin": "09:35 AM", "checkout": "06:35 PM", "report": "Worked on UI changes including font, spacing, and animation. Improved category interaction and subcategory sections and planned gift option feature."},
        {"date": "2026-02-13", "checkin": "09:30 AM", "checkout": "06:00 PM", "report": "Attended client meeting."},
        {"date": "2026-02-16", "checkin": "09:30 AM", "checkout": "06:30 PM", "report": "Created Steelco repo and aartees repo. Created users, fixed Adstra user management issues, prepared Steelco milestone planning, reworked project sheets, shared media and DB with team, worked on Python post content, and updated team section."},
        {"date": "2026-02-17", "checkin": "09:35 AM", "checkout": "06:45 PM", "report": "Created Steelco milestone sheet, reworked project management sheets, created user logins, and started Steelco application work."},
        {"date": "2026-02-18", "checkin": "09:30 AM", "checkout": "06:20 PM", "report": "Fixed invoice, proposal, and receipt errors in Adstra and continued pending tasks."},
        {"date": "2026-02-19", "checkin": "09:40 AM", "checkout": "06:30 PM", "report": "Handled invoice and receipt issue fixing and continued Steelco milestone sheet work."},
        {"date": "2026-02-20", "checkin": "09:30 AM", "checkout": "06:40 PM", "report": "Started core work on Steelco project and continued milestone creation."},
        {"date": "2026-02-21", "checkin": "09:35 AM", "checkout": "07:00 PM", "report": "Worked on Steelco user management and handled aartees rehosting."},
        {"date": "2026-02-22", "checkin": "09:30 AM", "checkout": "06:15 PM", "report": "Worked on aartees server tasks, Steelco user management, and milestone sheet updates."},
        {"date": "2026-02-24", "checkin": "09:30 AM", "checkout": "06:30 PM", "report": "Attended Blaze Education client meeting in Tirur and continued aartees work."},
        {"date": "2026-02-26", "checkin": "09:35 AM", "checkout": "06:50 PM", "report": "Fixed aartees design issues, fixed Adstra blog errors, and started Steelco CRM work."},
        {"date": "2026-02-27", "checkin": "09:30 AM", "checkout": "07:00 PM", "report": "Fixed Adstra blog issues and HTTPS routing issues. Started Steelco CRM user management and updated Steelco and Blaze Education milestone sheets."},
        {"date": "2026-03-01", "checkin": "09:40 AM", "checkout": "06:35 PM", "report": "Worked on Steelco user management module, role and permission setup, milestone sheet updates, and Steelco testing."},
        
        # March 2026
        {"date": "2026-03-02", "checkin": "09:30 AM", "checkout": "06:40 PM", "report": "Finished materials management final touch. Connected product master, quotation, order, and production sections. Updated production board, product configuration, and quotation section."},
        {"date": "2026-03-03", "checkin": "09:35 AM", "checkout": "07:00 PM", "report": "Worked on product verification, packing history, delivery management, and stock and inventory management."},
        {"date": "2026-03-05", "checkin": "09:30 AM", "checkout": "06:00 PM", "report": "Attended client meeting."},
        {"date": "2026-03-06", "checkin": "09:35 AM", "checkout": "06:30 PM", "report": "Planned Steelco client changes and started implementation."},
        {"date": "2026-03-07", "checkin": "09:30 AM", "checkout": "07:10 PM", "report": "Worked on customer section, category mapping, MB/FB mapping, order module mapping, testing, stock overview redesign, and stock-order connection."},
        {"date": "2026-03-09", "checkin": "09:30 AM", "checkout": "06:00 PM", "report": "Connected product master with MB and FB."},
        {"date": "2026-03-10", "checkin": "09:30 AM", "checkout": "06:00 PM", "report": "Continued Steelco client change implementation."},
        {"date": "2026-03-11", "checkin": "09:35 AM", "checkout": "07:00 PM", "report": "Rehosted VJ Foods website, updated Adstra blogs, handled Steelco pending work, and rehosted aartees website."},
        {"date": "2026-03-12", "checkin": "09:25 AM", "checkout": "06:10 PM", "report": "Rehosted aartees website, checked missing blogs in Adstra, completed Steelco workflow testing and final testing, and planned Oshin blog updates."},
        {"date": "2026-03-13", "checkin": "09:40 AM", "checkout": "07:15 PM", "report": "Reworked Steelco vendor management, performed full workflow testing, fixed workflow issues, and checked hosting setup."},
        {"date": "2026-03-16", "checkin": "09:30 AM", "checkout": "06:05 PM", "report": "Reworked Steelco return section and delivery section. Also handled hosting setup and deployment through cPanel."},
        {"date": "2026-03-18", "checkin": "09:50 AM", "checkout": "07:20 PM", "report": "Set up Blaze Education temporary hosting, attended Steelco client meeting, and corrected notes based on discussion."},
        {"date": "2026-03-19", "checkin": "09:30 AM", "checkout": "06:30 PM", "report": "Fixed Steelco process issues, identified delivery workflow issues, planned rehosting, shared live credentials with client, created Excel template for bulk upload, and fixed Blaze Education issues."},
        {"date": "2026-03-23", "checkin": "09:45 AM", "checkout": "07:10 PM", "report": "Identified live bugs and fixed them, rehosted website, improved Oshin PHP project speed, and updated payroll milestone sheet."},
        {"date": "2026-03-24", "checkin": "09:30 AM", "checkout": "06:20 PM", "report": "Worked on Oshin speed optimization, checked SEO-friendly blogs, created employee sheet, fixed report download issue, and handled recorded client changes."},
        {"date": "2026-03-25", "checkin": "09:35 AM", "checkout": "07:00 PM", "report": "Worked on Steelco final client change review, checked workflow corrections, handled pending fixes, and completed final reporting-oriented updates."},
        
        # Today
        {"date": "2026-03-26", "checkin": "09:32 AM", "checkout": None, "report": "Adding historical work reports to attendance table and identifying live bugs."}
    ]

    count = 0
    for entry in data:
        date_obj = datetime.strptime(entry["date"], "%Y-%m-%d").date()
        
        # Parse times
        checkin_time = None
        if entry["checkin"]:
            t = datetime.strptime(entry["checkin"], "%I:%M %p").time()
            checkin_time = timezone.make_aware(datetime.combine(date_obj, t))
            
        checkout_time = None
        if entry["checkout"]:
            t = datetime.strptime(entry["checkout"], "%I:%M %p").time()
            checkout_time = timezone.make_aware(datetime.combine(date_obj, t))

        # Format work report as JSON string
        work_report_json = json.dumps([{"category": "General", "description": entry["report"]}])

        # Create or update attendance
        attendance, created = Attendance.objects.update_or_create(
            user=user,
            date=date_obj,
            defaults={
                "checkin": checkin_time,
                "checkout": checkout_time,
                "work_report": work_report_json,
                "status": "Present",
                "validation": True,
                "salary_cut": 0
            }
        )
        if created:
            count += 1
            print(f"Created record for {entry['date']}")
        else:
            print(f"Updated record for {entry['date']}")

    print(f"Finished. Created {count} new records and updated others for user '{user.fullname}'.")

if __name__ == "__main__":
    populate_afsal_data()

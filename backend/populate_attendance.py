import os
import django
import random
import logging
from datetime import datetime, timedelta, time
from django.utils import timezone

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apis.attendance.models import Attendance
from apis.user.models import CustomUser

def create_dummy_data():
    # Ensure at least one user exists
    user = CustomUser.objects.first()
    if not user:
        logger.info("No users found. Creating 'testuser'...")
        user = CustomUser.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='password123',
            fullname='Test User',
            designation='Developer'
        )
    else:
        logger.info(f"Using existing user: {user.username}")

    # Define date range: Jan 1, 2026 to Today
    end_date = timezone.now().date()
    start_date = datetime(2026, 1, 1).date()
    
    current_date = start_date
    created_count = 0

    while current_date <= end_date:
        # Skip Sundays (optional, but realistic)
        if current_date.weekday() == 6:
            current_date += timedelta(days=1)
            continue

        # Check if record already exists
        if Attendance.objects.filter(user=user, date=current_date).exists():
            current_date += timedelta(days=1)
            continue

        # Generate random check-in/out times
        checkin_hour = random.randint(9, 10)
        checkin_minute = random.randint(0, 59)
        checkout_hour = random.randint(17, 19)
        checkout_minute = random.randint(0, 59)

        checkin_time = timezone.make_aware(datetime.combine(current_date, time(checkin_hour, checkin_minute)))
        checkout_time = timezone.make_aware(datetime.combine(current_date, time(checkout_hour, checkout_minute)))

        # Random Status
        status_choices = ['Present', 'Present', 'Present', 'Present', 'Half Day', 'Leave'] # Weighted towards Present
        status = random.choice(status_choices)

        if status == 'Leave':
            checkin_time = None
            checkout_time = None
        elif status == 'Half Day':
            checkout_time = timezone.make_aware(datetime.combine(current_date, time(13, 0)))

        Attendance.objects.create(
            user=user,
            date=current_date,
            checkin=checkin_time,
            checkout=checkout_time,
            status=status,
            location="11.2588, 75.7804", # Kozhikode coordinates
            work_report=f'[{{\"category\": \"Development\", \"description\": \"Worked on project module X on {current_date}\"}}]' if status != 'Leave' else None,
            validation=True
        )
        created_count += 1
        current_date += timedelta(days=1)

    logger.info(f"Successfully created {created_count} attendance records for user '{user.username}' from {start_date} to {end_date}.")

if __name__ == '__main__':
    create_dummy_data()

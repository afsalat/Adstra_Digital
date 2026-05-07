import os
import sqlite3
import django
import traceback
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apis.user.models import CustomUser
from apis.attendance.models import Attendance
from django.db import transaction, IntegrityError, connection

BACKUP_DB = 'db2.sqlite3'

def recover():
    if not os.path.exists(BACKUP_DB):
        logger.error(f"{BACKUP_DB} not found.")
        return

    conn = sqlite3.connect(BACKUP_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    target_names = ['wilson', 'afsal', 'aradhya']
    
    # Find users in backup
    users_to_recover = []
    cursor.execute("SELECT * FROM user_customuser")
    all_backup_users = cursor.fetchall()
    
    for user_row in all_backup_users:
        username = user_row['username'].lower()
        fullname = user_row['fullname'].lower() if user_row['fullname'] else ""
        
        if any(name in username or name in fullname for name in target_names):
            users_to_recover.append(user_row)
            logger.info(f"Found user to recover: {user_row['username']} (ID: {user_row['id']})")

    if not users_to_recover:
        logger.warning("No matching users found in backup.")
        return

    # Disable foreign key checks for the session if needed
    with connection.cursor() as django_cursor:
        django_cursor.execute("PRAGMA foreign_keys = OFF;")

    try:
        for user_row in users_to_recover:
            old_id = user_row['id']
            username = user_row['username']
            
            # Check if user already exists in current DB
            user_obj = CustomUser.objects.filter(username=username).first()
            if user_obj:
                logger.info(f"User {username} already exists in current DB. Using existing user.")
            else:
                # Prepare user data
                user_data = dict(user_row)
                password_hash = user_data.pop('password')
                
                # Filter data to only include fields that exist in the current model
                valid_fields = [f.name for f in CustomUser._meta.get_fields() if not f.is_relation or f.one_to_one or f.many_to_one]
                filtered_data = {k: v for k, v in user_data.items() if k in valid_fields}
                
                try:
                    user_obj = CustomUser(**filtered_data)
                    user_obj.password = password_hash
                    user_obj.save()
                    logger.info(f"Recovered user: {user_obj.username} (New ID: {user_obj.id})")
                except Exception as e:
                    logger.error(f"Failed to save user {username}: {e}")
                    logger.debug(traceback.format_exc())
                    continue

            # Now recover attendance for this user
            cursor.execute("SELECT * FROM attendance_attendance WHERE user_id = ?", (old_id,))
            attendance_rows = cursor.fetchall()
            
            count = 0
            for att_row in attendance_rows:
                att_data = dict(att_row)
                att_data.pop('id', None)
                
                # Check valid fields for Attendance
                att_valid_fields = [f.name for f in Attendance._meta.get_fields() if not f.is_relation or f.one_to_one or f.many_to_one]
                att_filtered_data = {k: v for k, v in att_data.items() if k in att_valid_fields and k != 'user'}
                
                try:
                    # Check if attendance already exists for this user and date
                    if not Attendance.objects.filter(user=user_obj, date=att_filtered_data['date']).exists():
                        Attendance.objects.create(user=user_obj, **att_filtered_data)
                        count += 1
                except Exception as e:
                    logger.error(f"Failed to save attendance for {username} on {att_filtered_data.get('date')}: {e}")
            
            logger.info(f"Recovered {count} attendance records for {user_obj.username}")

    finally:
        with connection.cursor() as django_cursor:
            django_cursor.execute("PRAGMA foreign_keys = ON;")

    conn.close()
    logger.info("Recovery process finished.")

if __name__ == '__main__':
    recover()

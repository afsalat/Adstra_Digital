import sqlite3
from datetime import date, timedelta

today = date(2026, 5, 8)
yesterday = today - timedelta(days=1)
dates_to_copy = [today.isoformat(), yesterday.isoformat()]

src_db = 'db (10).sqlite3'
dst_db = 'db.sqlite3'

def migrate_attendance():
    conn_src = sqlite3.connect(src_db)
    conn_dst = sqlite3.connect(dst_db)
    
    cursor_src = conn_src.cursor()
    cursor_dst = conn_dst.cursor()
    
    # Get rows from source
    cursor_src.execute("SELECT date, checkin, checkout, work_report, validation, status, location, user_id, salary_cut FROM attendance_attendance WHERE date IN (?, ?)", dates_to_copy)
    rows = cursor_src.fetchall()
    print(f"Found {len(rows)} potential rows to migrate from {src_db}")
    
    migrated_count = 0
    skipped_count = 0
    
    for row in rows:
        # Check if exists in destination
        cursor_dst.execute("SELECT id FROM attendance_attendance WHERE date = ? AND user_id = ?", (row[0], row[7]))
        existing = cursor_dst.fetchone()
        
        if existing:
            print(f"Skipping: Row for user {row[7]} on {row[0]} already exists (ID: {existing[0]})")
            skipped_count += 1
        else:
            # Insert into destination
            cursor_dst.execute("""
                INSERT INTO attendance_attendance 
                (date, checkin, checkout, work_report, validation, status, location, user_id, salary_cut) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, row)
            migrated_count += 1
    
    conn_dst.commit()
    conn_src.close()
    conn_dst.close()
    
    print(f"\nMigration finished:")
    print(f"Migrated: {migrated_count}")
    print(f"Skipped: {skipped_count}")

if __name__ == "__main__":
    migrate_attendance()

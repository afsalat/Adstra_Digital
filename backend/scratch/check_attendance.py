import sqlite3
from datetime import date, timedelta

today = date(2026, 5, 8)
yesterday = today - timedelta(days=1)

dates_to_copy = [today.isoformat(), yesterday.isoformat()]
print(f"Target dates: {dates_to_copy}")

def get_attendance(db_path, dates):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    # Use placeholders for dates
    query = "SELECT * FROM attendance_attendance WHERE date IN (?, ?)"
    cursor.execute(query, dates)
    rows = cursor.fetchall()
    # Get column names
    columns = [description[0] for description in cursor.description]
    conn.close()
    return columns, rows

cols, rows = get_attendance('db (9).sqlite3', dates_to_copy)
print(f"Found {len(rows)} rows in db (9).sqlite3")
for row in rows:
    print(row)

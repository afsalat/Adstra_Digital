import sqlite3
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()
cursor.execute("SELECT sql FROM sqlite_master WHERE name='attendance_attendance';")
print(cursor.fetchone()[0])
conn.close()

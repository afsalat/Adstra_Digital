import sqlite3

def get_schema(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(attendance_attendance);")
    schema = cursor.fetchall()
    conn.close()
    return schema

print("Schema of attendance_attendance in db.sqlite3:")
for col in get_schema('db.sqlite3'):
    print(col)

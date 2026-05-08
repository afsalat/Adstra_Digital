import sqlite3
import datetime

def list_tables(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in cursor.fetchall()]
    conn.close()
    return tables

print("Tables in db.sqlite3:")
print(list_tables('db.sqlite3'))
print("\nTables in db (9).sqlite3:")
print(list_tables('db (9).sqlite3'))

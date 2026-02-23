import sys
import os
import django
import sqlite3

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.db import connection

def check_sqlite_fks():
    print("Checking SQLite Foreign Keys pointing to 'proposal_client'...")
    results = []
    with connection.cursor() as cursor:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        for table in tables:
            table_name = table[0]
            cursor.execute(f"PRAGMA foreign_key_list({table_name});")
            fks = cursor.fetchall()
            
            for fk in fks:
                to_table = fk[2]
                if to_table == 'proposal_client':
                    idx = fk[0]
                    field = fk[3]
                    on_delete = fk[6]
                    
                    try:
                        cursor.execute(f"SELECT count(*) FROM {table_name} WHERE {field} = 1")
                        res = cursor.fetchone()
                        count = res[0] if res else 0
                    except:
                        count = "Error"
                        
                    results.append({
                        "table": table_name,
                        "field": field,
                        "on_delete": on_delete,
                        "count": count
                    })
    
    print("\n--- RESULTS ---")
    for r in results:
        print(f"Table: {r['table']}")
        print(f"  Field: {r['field']}")
        print(f"  On Delete: {r['on_delete']}")
        print(f"  Count for ID 1: {r['count']}")
        print("----------------")

try:
    check_sqlite_fks()
except Exception as e:
    print(f"Error: {e}")

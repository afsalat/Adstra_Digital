import requests
import json

url = "http://localhost:8000/settings/"
data = {
    "name": "Adstra Digital TEST",
    "email": "test@example.com",
    "terms_conditions": "Test terms // second rule"
}

try:
    # GET first to make sure it exists
    get_res = requests.get(url)
    print(f"GET Status: {get_res.status_code}")
    print(f"GET Data: {get_res.json()}")

    # PUT update
    put_res = requests.put(url, json=data)
    print(f"PUT Status: {put_res.status_code}")
    print(f"PUT Response: {put_res.text}")
except Exception as e:
    print(f"Error: {e}")

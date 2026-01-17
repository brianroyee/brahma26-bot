import requests

try:
    r = requests.post('http://localhost:8000/auth/setup')
    print(f"Status: {r.status_code}")
    print(f"Content: {r.text}")
except Exception as e:
    print(f"Error: {e}")

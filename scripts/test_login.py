import requests
import json

BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@brahma26.com"
ADMIN_PASSWORD = "admin"

def test_login():
    print("Testing Login...")
    try:
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        if res.status_code == 200:
            print("Login successful.")
        else:
            print(f"Login failed: {res.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()

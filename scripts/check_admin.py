import sys
import os

# Add backend to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.core.database import fetch_all

try:
    admins = fetch_all("SELECT * FROM admins")
    print(f"Found {len(admins)} admins:")
    for admin in admins:
        print(admin)
except Exception as e:
    print(f"Error: {e}")

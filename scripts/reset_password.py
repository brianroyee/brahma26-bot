import sys
import os

# Add backend to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.core.database import execute
from app.core.security import hash_password

try:
    new_hash = hash_password("admin")
    execute("UPDATE admins SET password_hash = ? WHERE email = ?", [new_hash, "admin@brahma26.com"])
    print("Password reset successfully")
except Exception as e:
    print(f"Error: {e}")

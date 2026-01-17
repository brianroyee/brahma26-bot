import sys
import os

# Add backend to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.core.database import execute_sql

try:
    result = execute_sql("SELECT name FROM sqlite_master WHERE type='table' AND name='telemetry'")
    print(f"Tables: {result}")
except Exception as e:
    print(f"Error: {e}")

"""
Turso Database Helper
Common functions for Turso HTTP API access.
"""
import os
import requests
from dotenv import load_dotenv

# Load .env from project root
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

def get_turso_config():
    """Get Turso URL and auth token from environment."""
    url = os.getenv("TURSO_DATABASE_URL", "")
    auth_token = os.getenv("TURSO_AUTH_TOKEN", "")
    
    # Convert libsql:// to https://
    if url.startswith("libsql://"):
        url = url.replace("libsql://", "https://")
    
    return url, auth_token

def execute_sql(sql: str, params=None):
    """Execute SQL via Turso HTTP API."""
    url, auth_token = get_turso_config()
    
    if not url or not auth_token:
        raise ValueError("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env")
    
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }
    
    stmt = {"sql": sql}
    if params:
        stmt["args"] = [{"type": "text", "value": str(p)} if isinstance(p, str) else {"type": "integer", "value": p} for p in params]
    
    payload = {
        "requests": [
            {"type": "execute", "stmt": stmt},
            {"type": "close"}
        ]
    }
    
    response = requests.post(f"{url}/v2/pipeline", headers=headers, json=payload)
    result = response.json()
    
    results = result.get("results", [])
    if results and results[0].get("type") == "ok":
        return results[0].get("response", {}).get("result", {})
    elif results and results[0].get("type") == "error":
        raise Exception(results[0].get("error", {}).get("message", "Unknown error"))
    
    return None

def fetch_all(sql: str, params=None):
    """Execute SQL and return all rows."""
    result = execute_sql(sql, params)
    if result:
        rows = result.get("rows", [])
        # Convert from Turso format to simple tuples
        return [[col.get("value") for col in row] for row in rows]
    return []

def fetch_one(sql: str, params=None):
    """Execute SQL and return first row."""
    rows = fetch_all(sql, params)
    return rows[0] if rows else None

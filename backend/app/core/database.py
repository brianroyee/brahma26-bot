"""
Database helper functions using Turso HTTP API
"""
import requests
from typing import Optional, List, Any
from app.core.config import settings

def execute_sql(sql: str, params: Optional[List[Any]] = None) -> dict:
    """Execute SQL via Turso HTTP API."""
    url = settings.database_url
    auth_token = settings.TURSO_AUTH_TOKEN
    
    if not url or not auth_token:
        raise ValueError("Database not configured")
    
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }
    
    stmt = {"sql": sql}
    if params:
        stmt["args"] = []
        for p in params:
            if p is None:
                stmt["args"].append({"type": "null"})
            elif isinstance(p, bool):
                stmt["args"].append({"type": "integer", "value": 1 if p else 0})
            elif isinstance(p, int):
                stmt["args"].append({"type": "integer", "value": p})
            elif isinstance(p, float):
                stmt["args"].append({"type": "float", "value": p})
            else:
                stmt["args"].append({"type": "text", "value": str(p)})
    
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
        raise Exception(results[0].get("error", {}).get("message", "Database error"))
    
    return {}

def fetch_all(sql: str, params: Optional[List[Any]] = None) -> List[dict]:
    """Execute SQL and return all rows as dicts."""
    result = execute_sql(sql, params)
    rows = result.get("rows", [])
    cols = result.get("cols", [])
    col_names = [c.get("name", f"col{i}") for i, c in enumerate(cols)]
    
    return [
        {col_names[i]: row[i].get("value") if row[i] else None for i in range(len(col_names))}
        for row in rows
    ]

def fetch_one(sql: str, params: Optional[List[Any]] = None) -> Optional[dict]:
    """Execute SQL and return first row as dict."""
    rows = fetch_all(sql, params)
    return rows[0] if rows else None

def execute(sql: str, params: Optional[List[Any]] = None) -> int:
    """Execute SQL and return affected rows."""
    result = execute_sql(sql, params)
    return result.get("affected_row_count", 0)

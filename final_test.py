#!/usr/bin/env python
"""Final test of all endpoints"""
import requests
import time
import sys

BASE_URL = "http://127.0.0.1:8000"

print("=" * 60)
print("SERVER ENDPOINT TESTS")
print("=" * 60)

# Wait for server
time.sleep(3)

tests = [
    ("GET", "/api/health", None),
    ("GET", "/health", None),
    ("GET", "/market/price/AAPL", None),
    ("GET", "/docs", None),
]

results = []
for method, endpoint, data in tests:
    try:
        if method == "GET":
            r = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
        else:
            r = requests.post(f"{BASE_URL}{endpoint}", json=data, timeout=10)
        
        status = r.status_code
        if status == 200:
            result = "OK"
            try:
                content = r.json()
                if isinstance(content, dict) and len(str(content)) < 100:
                    result += f" - {content}"
                else:
                    result += " - Response received"
            except:
                result += " - HTML/Text response"
        elif status == 404:
            result = "NOT FOUND"
        else:
            result = f"Status {status}"
        
        results.append((endpoint, status, result))
        print(f"{method:6} {endpoint:30} -> {result}")
    except Exception as e:
        results.append((endpoint, "ERROR", str(e)[:50]))
        print(f"{method:6} {endpoint:30} -> ERROR: {str(e)[:50]}")

print("=" * 60)
successful = sum(1 for _, status, _ in results if status == 200)
total = len(results)
print(f"Results: {successful}/{total} endpoints working")
print("=" * 60)

if successful > 0:
    print("\n[SUCCESS] Server is running!")
    print(f"Access API docs at: {BASE_URL}/docs")
    print(f"Health check: {BASE_URL}/api/health or {BASE_URL}/health")
else:
    print("\n[WARNING] Some endpoints are not responding correctly")
    sys.exit(1)

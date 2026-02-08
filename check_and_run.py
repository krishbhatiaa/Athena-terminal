#!/usr/bin/env python
"""Check for errors and run the server"""
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

print("Checking imports...")
try:
    from server.main import app
    print("✓ All imports successful")
except Exception as e:
    print(f"✗ Import error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\nChecking routes...")
api_routes = []
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        if '/api' in route.path or route.path == '/api/health':
            api_routes.append(f"{list(route.methods)} {route.path}")

if api_routes:
    print("✓ Found API routes:")
    for route in api_routes:
        print(f"  {route}")
else:
    print("⚠ No /api routes found")

print("\n" + "="*50)
print("Starting server on http://127.0.0.1:8000")
print("Press Ctrl+C to stop")
print("="*50 + "\n")

import uvicorn
uvicorn.run(
    "server.main:app",
    host="127.0.0.1",
    port=8000,
    reload=False,
    log_level="info"
)

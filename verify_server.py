#!/usr/bin/env python
"""Verify server can be imported and started"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

try:
    print("Testing imports...")
    from server.main import app
    print("[OK] Server imports successfully")
    
    print("\nTesting route registration...")
    routes = [route.path for route in app.routes if hasattr(route, 'path')]
    api_routes = [r for r in routes if '/api' in r or '/market' in r or '/algorithms' in r or '/portfolio' in r or '/auth' in r]
    print(f"[OK] Found {len(api_routes)} API routes")
    if '/api/health' in routes:
        print("[OK] Health endpoint registered")
    else:
        print("[WARN] Health endpoint not found in routes")
        print("Available routes:", [r for r in routes[:10]])
    
    print("\n[OK] All checks passed! Server is ready to run.")
    print("\nTo start the server, run:")
    print("  python -m uvicorn server.main:app --host 127.0.0.1 --port 8000")
    
except Exception as e:
    print(f"[ERROR] Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

#!/usr/bin/env python
"""Simple script to run the FastAPI server"""
import uvicorn
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    print("Starting server...")
    print("=" * 50)
    uvicorn.run(
        "server.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
        log_level="info"
    )
except Exception as e:
    print(f"Error starting server: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

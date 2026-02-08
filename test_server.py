#!/usr/bin/env python
"""Test script to verify server is running"""
import requests
import time
import sys

def test_server():
    url = "http://127.0.0.1:8000/api/health"
    max_retries = 10
    retry_delay = 1
    
    for i in range(max_retries):
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print("✓ Server is running successfully!")
                print(f"Status Code: {response.status_code}")
                print(f"Response: {response.json()}")
                return True
            else:
                print(f"Server responded with status {response.status_code}")
        except requests.exceptions.ConnectionError:
            if i < max_retries - 1:
                print(f"Waiting for server to start... (attempt {i+1}/{max_retries})")
                time.sleep(retry_delay)
            else:
                print("✗ Server is not responding. Make sure it's running on port 8000.")
                return False
        except Exception as e:
            print(f"Error: {e}")
            return False
    
    return False

if __name__ == "__main__":
    success = test_server()
    sys.exit(0 if success else 1)

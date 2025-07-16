#!/usr/bin/env python3
import requests
import json

# Test the webhook endpoint
url = "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/webhook/upload-attachments"

headers = {
    "X-API-Key": "docuai_demo_key_123",
    "Content-Type": "application/json"
}

data = {
    "subject": "Test-my-6",
    "from": "test@example.com",
    "to": "demo@docuai.com",
    "attachment_0": {
        "filename": "Test Document.pdf",
        "data": "filesystem-v2",
        "mimeType": "application/pdf"
    }
}

print("Testing webhook endpoint...")
print(f"URL: {url}")
print(f"Headers: {headers}")
print(f"Data: {json.dumps(data, indent=2)}")

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        print("SUCCESS: Webhook endpoint is working!")
    else:
        print(f"ERROR: Webhook returned {response.status_code}")
        
except Exception as e:
    print(f"ERROR: {e}")
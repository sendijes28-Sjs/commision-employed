import requests
import json
import os

OPENROUTER_API_KEY = (os.getenv("OPENROUTER_API_KEY") or "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").strip()

def find_flash():
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    response = requests.get("https://openrouter.ai/api/v1/models", headers=headers)
    if response.status_code == 200:
        data = response.json().get('data', [])
        print("Flash models found:")
        for m in data:
            if 'flash' in m['id'].lower() and 'gemini' in m['id'].lower():
                print(f"- {m['id']}")
    else:
        print(f"Failed: {response.status_code}")

if __name__ == "__main__":
    find_flash()

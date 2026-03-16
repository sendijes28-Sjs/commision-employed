import requests
import json
import os

key = "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"

def search():
    r = requests.get("https://openrouter.ai/api/v1/models")
    if r.status_code == 200:
        models = r.json().get('data', [])
        for m in models:
            id = m['id']
            if 'flash' in id.lower() and 'gemini' in id.lower():
                print(id)
    else:
        print(f"Error: {r.status_code}")

if __name__ == "__main__":
    search()

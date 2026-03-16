import requests
import json
import os

OPENROUTER_API_KEY = (os.getenv("OPENROUTER_API_KEY") or "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").strip()

def test_models():
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    response = requests.get("https://openrouter.ai/api/v1/models", headers=headers)
    if response.status_code == 200:
        data = response.json().get('data', [])
        print("Searching for Gemini models...")
        for m in data:
            if 'gemini' in m['id'].lower():
                print(f"Model: {m['id']}")
    else:
        print(f"Failed to list models: {response.status_code}")

def test_free_chat():
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/apawardhana/Absention-employe",
        "X-Title": "Glory Test"
    }
    # Using a known free model
    data = {
        "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
        "messages": [{"role": "user", "content": "hello"}]
    }
    print(f"Testing chat completion with FREE model: {data['model']}")
    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
    print(f"Chat status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_models()
    print("-" * 20)
    test_free_chat()
    print("-" * 20)
    # Also test the model I used in parser
    data = {
        "model": "google/gemini-flash-1.5",
        "messages": [{"role": "user", "content": "hello"}]
    }
    print(f"Testing chat completion with model: {data['model']}")
    response = requests.post("https://openrouter.ai/api/v1/chat/completions", 
                             headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}", "Content-Type": "application/json", "HTTP-Referer": "https://github.com/apawardhana/Absention-employe", "X-Title": "Glory Test"}, 
                             json=data)
    print(f"Chat status: {response.status_code}")
    print(f"Response: {response.text}")

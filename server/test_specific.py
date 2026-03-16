import requests
import json
import os

key = "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"

def test_model(model_id):
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/apawardhana/Absention-employe",
        "X-Title": "Glory Test"
    }
    data = {
        "model": model_id,
        "messages": [{"role": "user", "content": "hi"}]
    }
    print(f"Testing {model_id}...")
    r = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")

if __name__ == "__main__":
    test_model("google/gemini-2.0-flash-001")
    print("-" * 20)
    test_model("openai/gpt-4o-mini")

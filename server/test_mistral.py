import requests
import json
import os

key = "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"

def test():
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/apawardhana/Absention-employe",
        "X-Title": "Glory Test"
    }
    data = {
        "model": "mistralai/mistral-7b-instruct:free",
        "messages": [{"role": "user", "content": "hi"}]
    }
    r = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
    print(r.status_code)
    print(r.text)

if __name__ == "__main__":
    test()

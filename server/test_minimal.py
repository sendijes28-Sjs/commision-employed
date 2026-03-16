import requests
import json

key = "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"

def test():
    # minimalist test
    r = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {key}"},
        json={
            "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
            "messages": [{"role": "user", "content": "hi"}]
        }
    )
    print(r.status_code)
    print(r.text)

if __name__ == "__main__":
    test()

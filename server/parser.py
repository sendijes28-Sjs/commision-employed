import sys
import json
import os
import requests
import base64
from pdf2image import convert_from_path
from PIL import Image
import io

# Configuration for OpenRouter
OPENROUTER_API_KEY = (os.getenv("OPENROUTER_API_KEY") or "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").strip()

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def pil_to_base64(pil_img):
    buffered = io.BytesIO()
    pil_img.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def analyze_document_with_ai(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    base64_images = []

    if ext == '.pdf':
        try:
            pages = convert_from_path(file_path, 200) # 200 DPI is usually enough for AI
            # For now, just take the first page to save tokens/time
            if pages:
                base64_images.append(pil_to_base64(pages[0]))
        except Exception as e:
            return {"error": f"PDF Conversion failed: {str(e)}"}
    else:
        # It's an image
        base64_images.append(encode_image(file_path))

    if not base64_images:
        return {"error": "No images extracted from file"}

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/apawardhana/Absention-employe",
        "X-Title": "Glory Invoice Parser"
    }
    
    # We use Google Gemini Flash 1.5 because it's fast, has great vision, and is cheap
    # Alternative: openai/gpt-4o-mini
    model = "google/gemini-2.0-flash-001"
    
    # Create the prompt with vision content
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": """
                    ROLE: You are an expert forensic internal auditor.
                    TASK: Analyze the attached image of a 'GLORY Interior & Property' invoice and extract data into a consistent JSON format.
                    
                    RULES:
                    1. Extract 'invoiceNumber' (usually format INV/XX/XX/XXXXXX).
                    2. Extract 'date' (format YYYY-MM-DD).
                    3. Extract 'customerName' (include name and address if available).
                    4. Extract 'items' as an array of objects:
                       { "productName": string, "quantity": number, "price": number, "subtotal": number }
                    5. Clean up product names (remove artifacts).
                    6. Ensure 'price' is the unit price.
                    7. Ignore discounts or additional taxes in the item list, just the base items.
                    
                    OUTPUT ONLY VALID JSON.
                    """
                }
            ]
        }
    ]

    # Add images to content
    for b64 in base64_images:
        messages[0]["content"].append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{b64}"
            }
        })

    data = {
        "model": model,
        "messages": messages
    }
    
    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
        response.raise_for_status()
        response_json = response.json()
        
        if 'choices' not in response_json:
             return {"error": "AI response missing 'choices'", "debug": response_json}
             
        content = response_json['choices'][0]['message']['content']
        
        # Clean markdown if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        return json.loads(content)
    except Exception as e:
        # Fallback if AI fails or response is weird
        return {"error": f"AI Vision Parsing failed: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
        
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File not found: {file_path}"}))
        sys.exit(1)
        
    structured_data = analyze_document_with_ai(file_path)
    print(json.dumps(structured_data))

import sys
import json
import os
import requests
import base64
from PIL import Image
import io
import sqlite3
import difflib
import re
from typing import Any

# Configuration for OpenRouter
OPENROUTER_API_KEY = (os.getenv("OPENROUTER_API_KEY") or "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").strip()

def get_similarity(s1, s2):
    if not s1 or not s2: return 0.0
    s1 = str(s1).lower().strip()
    s2 = str(s2).lower().strip()
    
    if s1 == s2: return 1.0
    
    # Check if all words from s1 are in s2 or vice versa (Multi-word match)
    words1 = set(re.findall(r'\w{3,}', s1))
    words2 = set(re.findall(r'\w{3,}', s2))
    
    if words1 and words2:
        intersection = words1.intersection(words2)
        if len(intersection) >= min(len(words1), len(words2)):
            return 1.0
        # If most words match, give it a high score
        if len(intersection) / max(len(words1), len(words2)) >= 0.7:
            return 0.95

    # Substring check
    if len(s1) >= 4 and (s1 in s2 or s2 in s1): return 1.0
    
    # Split matching (handle delimiters like " - ", "/", "(", ")")
    parts = re.split(r'[\-\/\(\)]', s2)
    for p in parts:
        p = p.strip().lower()
        if len(p) >= 4 and (p in s1 or s1 in p): return 1.0
        
    return difflib.SequenceMatcher(None, s1, s2).ratio()

def compare_dates(d1, d2):
    if not d1 or not d2: return False
    c1 = re.sub(r'[^0-9]', '', str(d1))
    c2 = re.sub(r'[^0-9]', '', str(d2))
    return c1 == c2 or str(d1) in str(d2) or str(d2) in str(d1)

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def pil_to_base64(pil_img):
    buffered = io.BytesIO()
    pil_img.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def analyze_document_with_ai(file_paths):
    if isinstance(file_paths, str):
        file_paths = [file_paths]
        
    base64_images = []

    for file_path in file_paths:
        ext = os.path.splitext(file_path)[1].lower()
        if ext in ['.jpg', '.jpeg', '.png', '.webp', '.bmp']:
            base64_images.append(encode_image(file_path))
        elif ext == '.pdf':
            try:
                import fitz
                doc = fitz.open(file_path)
                for page in doc:
                    pix = page.get_pixmap(dpi=200)
                    img_bytes = pix.tobytes("jpeg")
                    base64_images.append(base64.b64encode(img_bytes).decode('utf-8'))
                doc.close()
            except ImportError:
                return {"error": "PDF support requires PyMuPDF. Please run 'pip install PyMuPDF'."}
            except Exception as e:
                return {"error": f"Failed to process PDF file: {str(e)}"}
        else:
            print(f"Skipping unsupported file type: {ext}", file=sys.stderr)

    if not base64_images:
        return {"error": "No images extracted from provided files"}

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/apawardhana/commision-employe",
        "X-Title": "Glory Invoice Parser"
    }
    
    model = "google/gemini-2.0-flash-001"
    
    content: list[dict[str, Any]] = [
        {
            "type": "text",
            "text": """
                    ROLE: Expert Forensic Internal Auditor.
                    TASK: Analyze 'GLORY Interior & Property' invoice documents and extract data.
                    
                    STRICT RULES FOR MULTI-PAGE/MULTI-IMAGE DATA:
                    1. Detect the 'invoiceNumber' on EVERY page/image.
                    2. If you find DIFFERENT invoice numbers across images, STOP and return ONLY: { "error": "Multiple Invoice Numbers detected" }.
                    3. Only extract items if ALL pages belong to the SAME invoice number.
                    4. Aggregate all 'items' from all pages into a single array.
                    5. Ensure no duplicate items if content overlaps between pages.
                    
                    GENERAL EXTRACTION RULES:
                    1. Extract 'invoiceNumber' (format: INV/XX/XX/XXXXXX).
                    2. Extract 'date' (format: YYYY-MM-DD).
                    3. Extract 'customerName'.
                    4. Extract 'items' as array:
                       { "productName": string, "quantity": number, "price": number, "subtotal": number }
                    5. IMPORTANT: In 'productName', extract the FULL 'Nama Barang' string. DO NOT truncate.
                    6. Ensure 'price' is the unit price.
                    7. Output ONLY valid JSON.
                    """
        }
    ]
    
    messages = [
        {
            "role": "user",
            "content": content
        }
    ]

    for b64 in base64_images:
        content.append({
            "type": "image_url",
            "image_url": { "url": f"data:image/jpeg;base64,{b64}" }
        })

    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json={"model": model, "messages": messages}, timeout=90)
        response.raise_for_status()
        res_json = response.json()
        content = res_json['choices'][0]['message']['content']
        
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        data = json.loads(content)
        if "error" in data:
            return data
        return data
    except Exception as e:
        return {"error": f"AI Parsing failed: {str(e)}"}

def perform_validation(extracted_data, db_path):
    if "error" in extracted_data: return extracted_data
    
    if not os.path.exists(db_path):
        extracted_data["verification"] = {"found": False, "error": "Database not found"}
        return extracted_data

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # 1. Match Invoice Header
    invoice_number = extracted_data.get('invoiceNumber', '').strip()
    cursor.execute("SELECT * FROM master_ledger WHERE TRIM(invoice_number) = ? COLLATE NOCASE", (invoice_number,))
    ledger_match = cursor.fetchone()
    
    verification = {
        "found": bool(ledger_match),
        "invoiceMatched": bool(ledger_match),
        "dateMatched": False,
        "items": []
    }
    
    ledger_items = []
    if ledger_match:
        verification["ledgerDate"] = ledger_match["date"]
        verification["dateMatched"] = compare_dates(ledger_match["date"], extracted_data.get("date"))
        
        cursor.execute("SELECT * FROM master_ledger_items WHERE ledger_id = ?", (ledger_match["id"],))
        ledger_items = [dict(row) for row in cursor.fetchall()]

    # 2. Get all products for Price List validation
    cursor.execute("SELECT name, sku, bottom_price FROM products")
    all_products = [dict(row) for row in cursor.fetchall()]
    
    # 3. Process Items
    matched_ledger_ids = set()
    print(f"[PY-DEBUG] Processing {len(extracted_data.get('items', []))} items from OCR", file=sys.stderr)
    print(f"[PY-DEBUG] Ledger items available for match: {len(ledger_items)}", file=sys.stderr)

    for i, item in enumerate(extracted_data.get("items", [])):
        scanned_name = item.get("productName", "")
        scanned_qty = float(item.get("quantity", 0))
        scanned_price = float(item.get("price", 0))
        
        print(f"[PY-DEBUG] Item {i+1}: '{scanned_name}' (Qty: {scanned_qty})", file=sys.stderr)
        
        # A. Master Match (Ledger)
        ledger_item = None
        best_score = 0
        
        for li in ledger_items:
            if li["id"] in matched_ledger_ids: continue
            
            score = get_similarity(li["product_name"], scanned_name)
            
            # Boost if quantity matches exactly
            if abs(float(li["quantity"]) - scanned_qty) < 0.01:
                score += 0.05
            
            if score > best_score:
                best_score = score
                ledger_item = li
        
        print(f"[PY-DEBUG] -> Best Ledger Match: '{ledger_item['product_name'] if ledger_item else 'NONE'}' (Score: {best_score:.3f})", file=sys.stderr)
        
        if best_score < 0.80: # Slightly lower threshold for Indonesian descriptive names
            ledger_item = None
            
        if ledger_item:
            matched_ledger_ids.add(ledger_item["id"])
        
        # B. Price Match (Product Table)
        product_record = None
        p_best_score = 0
        for p in all_products:
            score = max(get_similarity(p["name"], scanned_name), 
                        get_similarity(p["sku"], scanned_name) if p["sku"] else 0)
            if score > p_best_score:
                p_best_score = score
                product_record = p
        
        print(f"[PY-DEBUG] -> Best Price Match: '{product_record['name'] if product_record else 'NONE'}' (Score: {p_best_score:.3f})", file=sys.stderr)
        
        if p_best_score < 0.80:
            product_record = None

        # C. Comparative Validation
        v_item = {
            "productName": scanned_name,
            "isMasterMatch": bool(ledger_item),
            "isPriceMatch": bool(product_record),
            "qtyMatched": False,
            "priceMatched": False, # Matches Ledger Price
            "isBelowBottom": False,
            "ledgerItem": ledger_item["product_name"] if ledger_item else None,
            "ledgerPrice": float(ledger_item["price"]) if ledger_item else 0,
            "ledgerQty": float(ledger_item["quantity"]) if ledger_item else 0,
            "productMatch": product_record["name"] if product_record else None,
            "bottomPrice": float(product_record["bottom_price"]) if product_record else 0
        }
        
        if ledger_item:
            v_item["qtyMatched"] = abs(scanned_qty - float(ledger_item["quantity"])) < 0.01
            v_item["priceMatched"] = abs(scanned_price - float(ledger_item["price"])) < 1.0 # Tolerance for rounding
            
        if product_record:
            # Check price against bottom price
            v_item["isBelowBottom"] = scanned_price < float(product_record["bottom_price"])
            
        verification["items"].append(v_item)
        
    extracted_data["verification"] = verification
    conn.close()
    return extracted_data

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
        
    file_paths = sys.argv[1:]
    db_path = os.path.join(os.path.dirname(__file__), "..", "database.sqlite")
    
    extracted = analyze_document_with_ai(file_paths)
    final_result = perform_validation(extracted, db_path)
    
    print(json.dumps(final_result))

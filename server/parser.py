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

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()

MODELS = [
    "google/gemma-4-31b-it:free",
    "google/gemma-3-27b-it:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "google/gemma-3-12b-it:free",
]

def get_similarity(s1, s2):
    if not s1 or not s2: return 0.0
    s1 = str(s1).lower().strip()
    s2 = str(s2).lower().strip()
    if s1 == s2: return 1.0
    ratio = difflib.SequenceMatcher(None, s1, s2).ratio()
    if len(s1) >= 4 and s1 in s2:
        coverage = len(s1) / len(s2)
        ratio = max(ratio, 0.4 + (0.5 * coverage))
    return ratio

def compare_dates(d1, d2):
    if not d1 or not d2: return False
    c1 = re.sub(r'[^0-9]', '', str(d1))
    c2 = re.sub(r'[^0-9]', '', str(d2))
    return c1 == c2 or str(d1) in str(d2) or str(d2) in str(d1)

def pil_to_base64(pil_img):
    buffered = io.BytesIO()
    pil_img.save(buffered, format="JPEG", quality=80)
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def process_image(image_path_or_bytes):
    if isinstance(image_path_or_bytes, str):
        img = Image.open(image_path_or_bytes)
    else:
        img = Image.open(io.BytesIO(image_path_or_bytes))
    if img.mode != 'RGB':
        img = img.convert('RGB')
    max_size = 1024
    w, h = img.size
    if w > max_size or h > max_size:
        if w > h:
            new_w, new_h = max_size, int(h * max_size / w)
        else:
            new_w, new_h = int(w * max_size / h), max_size
        img = img.resize((new_w, new_h), Image.LANCZOS)
    return pil_to_base64(img)

def analyze_document_with_ai(file_paths):
    if not OPENROUTER_API_KEY:
        return {"error": "OPENROUTER_API_KEY not set in .env file"}
    if isinstance(file_paths, str):
        file_paths = [file_paths]
    base64_images = []
    for file_path in file_paths:
        ext = os.path.splitext(file_path)[1].lower()
        if ext in ['.jpg', '.jpeg', '.png', '.webp', '.bmp']:
            base64_images.append(process_image(file_path))
        elif ext == '.pdf':
            try:
                import fitz
                doc = fitz.open(file_path)
                for page in doc:
                    pix = page.get_pixmap(dpi=150)
                    img_bytes = pix.tobytes("jpeg")
                    base64_images.append(process_image(img_bytes))
                doc.close()
            except ImportError:
                return {"error": "PDF support requires PyMuPDF. Please run 'pip install PyMuPDF'."}
            except Exception as e:
                return {"error": f"Failed to process PDF file: {str(e)}"}
    if not base64_images:
        return {"error": "No images extracted from provided files"}

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/apawardhana/commision-employe",
        "X-Title": "Glory Invoice Parser"
    }

    content: list[dict[str, Any]] = [
        {
            "type": "text",
            "text": """
                    TASK: Extract 'GLORY Interior & Property' invoice data.
                    RULES:
                    1. Detect 'invoiceNumber' (INV/XX/XX/XXXXXX). ERROR if inconsistent across images.
                    2. Extract: 'invoiceNumber', 'date' (YYYY-MM-DD), 'customerName', and 'items'.
                    3. Items: { "productName": string (Include exact SKU/Codes if present), "quantity": number, "price": number, "subtotal": number }
                    4. Aggregate all items from all images. No duplicates.
                    5. Output JSON ONLY.
                    """
        }
    ]

    for b64 in base64_images:
        content.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
        })

    messages = [{"role": "user", "content": content}]

    last_error = None
    for model in MODELS:
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json={"model": model, "messages": messages},
                timeout=90
            )
            if response.status_code == 429:
                last_error = f"Rate limit on {model}"
                continue
            response.raise_for_status()
            res_json = response.json()
            result_content = res_json['choices'][0]['message']['content']
            if "```json" in result_content:
                result_content = result_content.split("```json")[1].split("```")[0].strip()
            elif "```" in result_content:
                result_content = result_content.split("```")[1].split("```")[0].strip()
            data = json.loads(result_content)
            if "error" in data:
                return data
            return data
        except Exception as e:
            last_error = str(e)
            continue

    return {"error": f"AI Parsing failed on all models: {last_error}"}

def perform_validation(extracted_data, db_path):
    if "error" in extracted_data: return extracted_data
    if not os.path.exists(db_path):
        extracted_data["verification"] = {"found": False, "error": "Database not found"}
        return extracted_data

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

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

    cursor.execute("SELECT name, sku, bottom_price FROM products")
    all_products = [dict(row) for row in cursor.fetchall()]

    matched_ledger_ids = set()

    for i, item in enumerate(extracted_data.get("items", [])):
        scanned_name = item.get("productName", "")
        scanned_qty = float(item.get("quantity", 0))
        scanned_price = float(item.get("price", 0))

        ledger_item = None
        best_score = 0
        for li in ledger_items:
            if li["id"] in matched_ledger_ids: continue
            score = get_similarity(li["product_name"], scanned_name)
            if abs(float(li["quantity"]) - scanned_qty) < 0.01:
                score += 0.05
            if score > best_score:
                best_score = score
                ledger_item = li
        if best_score < 0.70:
            ledger_item = None
        if ledger_item:
            matched_ledger_ids.add(ledger_item["id"])

        product_record = None
        p_best_score = 0
        scan_lower = scanned_name.lower().strip()
        scan_parts = [part.strip() for part in scanned_name.split(" - ") if part.strip()]

        if len(scan_parts) >= 1:
            sku_candidate = scan_parts[0].strip()
            for p in all_products:
                if p["sku"] and str(p["sku"]).strip().lower() == sku_candidate.lower():
                    product_record = p
                    p_best_score = 1.0
                    break

        if not product_record:
            for p in all_products:
                name_score = get_similarity(p["name"], scanned_name)
                sku_score = get_similarity(p["sku"], scanned_name) if p["sku"] else 0
                combined_dash = f"{str(p['sku']).strip()} - {str(p['name']).strip()}" if p["sku"] else str(p["name"])
                combined_dash_score = get_similarity(combined_dash, scanned_name)
                combined_str = f"{str(p['sku']).strip()} {str(p['name']).strip()}" if p["sku"] else str(p["name"])
                combined_score = get_similarity(combined_str, scanned_name)
                part_scores = []
                for part in scan_parts:
                    part_name_score = get_similarity(p["name"], part)
                    part_sku_score = get_similarity(p["sku"], part) if p["sku"] else 0
                    part_scores.append(max(part_name_score, part_sku_score))
                best_part_score = max(part_scores) if part_scores else 0
                sku_bonus = 0
                if p["sku"]:
                    sku_lower = str(p["sku"]).lower().strip()
                    if len(sku_lower) >= 4 and sku_lower in scan_lower:
                        if re.search(r'\b' + re.escape(sku_lower) + r'\b', scan_lower):
                            sku_bonus = 0.86 + min(0.13, len(sku_lower) / 100)
                score = max(name_score, sku_score, combined_dash_score, combined_score, best_part_score, sku_bonus)
                if score > p_best_score:
                    p_best_score = score
                    product_record = p
            if p_best_score < 0.80:
                product_record = None

        v_item = {
            "productName": scanned_name,
            "isMasterMatch": bool(ledger_item),
            "isPriceMatch": bool(product_record),
            "qtyMatched": False,
            "priceMatched": False,
            "isBelowBottom": False,
            "ledgerItem": ledger_item["product_name"] if ledger_item else None,
            "ledgerPrice": float(ledger_item["price"]) if ledger_item else 0,
            "ledgerQty": float(ledger_item["quantity"]) if ledger_item else 0,
            "productMatch": product_record["name"] if product_record else None,
            "bottomPrice": float(product_record["bottom_price"]) if product_record else 0
        }
        if ledger_item:
            v_item["qtyMatched"] = abs(scanned_qty - float(ledger_item["quantity"])) < 0.01
            v_item["priceMatched"] = abs(scanned_price - float(ledger_item["price"])) < 1.0
        if product_record:
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
const Database = require('better-sqlite3');
const db = new Database('database.sqlite');
const ocr = db.prepare('SELECT result_json FROM ocr_cache ORDER BY id DESC LIMIT 1').get();
const parsed = JSON.parse(ocr.result_json);
console.log('OCR Invoice:', parsed.invoiceNumber);
const inv = db.prepare('SELECT * FROM invoices WHERE invoice_number = ?').get(parsed.invoiceNumber);
console.log('DB Invoice:', inv);

import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

try {
  console.log('=== SYSTEM-WIDE DATA INTEGRITY AUDIT ===\n');

  // 1. Items with 0 margin (price == bottom_price)
  const zeroMargin = db.prepare('SELECT COUNT(*) as count FROM invoice_items WHERE price = bottom_price AND price > 0').get();
  console.log(`[!] Invoice Items with 0 Margin (Suspicious): ${zeroMargin.count}`);

  // 2. Items with 0 bottom price
  const zeroBottom = db.prepare('SELECT COUNT(*) as count FROM invoice_items WHERE bottom_price = 0').get();
  console.log(`[!] Invoice Items with 0 Bottom Price: ${zeroBottom.count}`);

  // 3. Products not in Master Product List
  // We check items in invoices that don't have a fuzzy match or SKU in products
  // For simplicity, we just check how many unique names in invoices are NOT exactly in products
  const unknownProducts = db.prepare(`
    SELECT COUNT(DISTINCT product_name) as count 
    FROM invoice_items 
    WHERE LOWER(product_name) NOT IN (SELECT LOWER(name) FROM products)
  `).get();
  console.log(`[!] Unique Product Names in Invoices NOT in Product Master: ${unknownProducts.count}`);

  // 4. Ledger vs Invoice Total Mismatches
  const mismatches = db.prepare(`
    SELECT COUNT(*) as count FROM invoices i
    JOIN master_ledger m ON i.invoice_number = m.invoice_number
    WHERE i.total_amount != m.total_amount AND m.total_amount > 0
  `).get();
  console.log(`[!] Invoices with Total Amount mismatch with Master Ledger: ${mismatches.count}`);

  // 5. Example of problematic items (Top 5)
  console.log('\n--- TOP 5 SUSPICIOUS ITEMS ---');
  const examples = db.prepare(`
    SELECT i.invoice_number, ii.product_name, ii.price, ii.bottom_price 
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE ii.price = ii.bottom_price 
    LIMIT 5
  `).all();
  console.table(examples);

} catch (err) {
  console.error(err);
} finally {
  db.close();
}

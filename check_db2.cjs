const Database = require('better-sqlite3');
const db = new Database('database.sqlite');
const limit = 5;
const invoices = db.prepare('SELECT id FROM invoices ORDER BY id DESC LIMIT ?').all(limit);
console.log('Found invoices to delete:', invoices);
const ids = invoices.map(i => i.id);
if (ids.length > 0) {
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM invoice_items WHERE invoice_id IN (${placeholders})`).run(...ids);
  db.prepare(`DELETE FROM invoices WHERE id IN (${placeholders})`).run(...ids);
  console.log(`Deleted recent ${ids.length} test invoices.`);
}

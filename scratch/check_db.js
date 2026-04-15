import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

try {
  console.log('--- GLOBAL SEARCH IN MASTER LEDGER ITEMS ---');
  const items = db.prepare('SELECT * FROM master_ledger_items WHERE product_name LIKE ?').all('%KISI%');
  console.log('Found:', items.length);
  console.table(items.slice(0, 20));

  console.log('\n--- GLOBAL SEARCH IN INVOICE ITEMS ---');
  const res = db.prepare('SELECT * FROM invoice_items WHERE product_name LIKE ?').all('%KISI%');
  console.table(res.slice(0, 20));

} catch (err) {
  console.error(err);
} finally {
  db.close();
}

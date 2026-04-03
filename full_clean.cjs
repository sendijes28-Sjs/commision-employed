const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Starting full database cleanup...');

try {
  db.pragma('foreign_keys = OFF');
  
  db.exec('DELETE FROM invoice_items');
  db.exec('DELETE FROM invoices');
  db.exec('DELETE FROM payout_items');
  db.exec('DELETE FROM payouts');
  db.exec('DELETE FROM master_ledger_items');
  db.exec('DELETE FROM master_ledger');
  db.exec('DELETE FROM products');
  db.exec('DELETE FROM ocr_cache');
  
  // Keep only super admins
  const result = db.prepare("DELETE FROM users WHERE role NOT IN ('super_admin', 'Super Admin')").run();
  console.log(`Cleared ${result.changes} non-admin users.`);
  
  db.pragma('foreign_keys = ON');

  console.log('Database cleanup complete. Only Super Admins remain.');
} catch (error) {
  console.error('Error during cleanup:', error);
} finally {
  db.close();
}

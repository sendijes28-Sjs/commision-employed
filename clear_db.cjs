const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new Database(dbPath);

const tablesToClear = [
  'payout_items',
  'payouts',
  'invoice_items',
  'invoices',
  'master_ledger_items',
  'master_ledger',
  'ocr_cache',
  'products'
];

try {
  db.exec('BEGIN TRANSACTION');
  
  tablesToClear.forEach(table => {
    db.prepare(`DELETE FROM ${table}`).run();
    try {
        db.prepare(`DELETE FROM sqlite_sequence WHERE name='${table}'`).run();
    } catch(e) {}
  });

  db.exec('COMMIT');
  console.log('Database successfully cleared. Users and Settings kept intact.');
} catch (error) {
  db.exec('ROLLBACK');
  console.error('Error clearing database:', error);
}

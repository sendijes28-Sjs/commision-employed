import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('./database.sqlite');
console.log('Targeting database at:', dbPath);

const db = new Database(dbPath);

try {
  console.log('Starting total database cleanup (preserving users)...');

  // Disable constraints temporarily for easier cleanup OR follow correct order
  db.pragma('foreign_keys = OFF');

  const tablesToClear = [
    'audit_logs',
    'payout_items',
    'payouts',
    'invoice_items',
    'invoices',
    'master_ledger_items',
    'master_ledger',
    'products',
    'settings',
    'ocr_cache'
  ];

  db.transaction(() => {
    for (const table of tablesToClear) {
      console.log(`Clearing table: ${table}`);
      db.prepare(`DELETE FROM ${table}`).run();
      // Reset autoincrement sequence
      db.prepare(`DELETE FROM sqlite_sequence WHERE name = ?`).run(table);
    }
  })();

  console.log('Cleanup complete. The "users" table has been preserved.');

  // Verification
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  console.log(`Remaining users: ${userCount.count}`);

} catch (err) {
  console.error('Cleanup failed:', err);
} finally {
  db.pragma('foreign_keys = ON');
  db.close();
}

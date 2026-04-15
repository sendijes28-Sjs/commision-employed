const Database = require('better-sqlite3');
const path = require('path');

const db = new Database('./database.sqlite');

try {
  const ledger = db.prepare('SELECT * FROM master_ledger LIMIT 5').all();
  console.log('--- Master Ledger Sample ---');
  console.log(JSON.stringify(ledger, null, 2));

  const itemsCount = db.prepare('SELECT COUNT(*) as count FROM master_ledger_items').get();
  console.log('\nMaster Ledger Items Count:', itemsCount.count);
  
} catch (err) {
  console.error(err);
} finally {
  db.close();
}

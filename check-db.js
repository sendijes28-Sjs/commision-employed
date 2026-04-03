import Database from 'better-sqlite3';
const db = new Database('./database.sqlite');
try {
  const inv = db.prepare('SELECT COUNT(*) as count FROM invoices').get();
  const prod = db.prepare('SELECT COUNT(*) as count FROM products').get();
  const pay = db.prepare('SELECT COUNT(*) as count FROM payouts').get();
  console.log(`Invoices: ${inv.count}`);
  console.log(`Products: ${prod.count}`);
  console.log(`Payouts: ${pay.count}`);
} catch (e) {
  console.error(e.message);
}
db.close();

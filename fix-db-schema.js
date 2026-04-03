import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, './database.sqlite');
const db = new Database(dbPath);

console.log('Starting DB migration...');

try {
    db.transaction(() => {
        // 1. Disable foreign keys
        db.exec('PRAGMA foreign_keys=OFF');
        
        console.log('Checking current schema...');
        const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='invoices'").get();
        if (!tableInfo) {
            console.error("Table 'invoices' not found in database.");
            return;
        }
        const schema = tableInfo.sql;
        if (schema.includes("'Paid'")) {
            console.log("Schema already includes 'Paid'. No migration needed.");
            return;
        }

        console.log('Migrating invoices, invoice_items, and payout_items...');

        // Rename old tables
        db.exec('ALTER TABLE invoice_items RENAME TO invoice_items_old');
        db.exec('ALTER TABLE payout_items RENAME TO payout_items_old');
        db.exec('ALTER TABLE invoices RENAME TO invoices_old');

        // Create new tables with correct CHECK constraint
        db.exec(`
          CREATE TABLE invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_number TEXT UNIQUE NOT NULL,
            date TEXT NOT NULL,
            customer_name TEXT NOT NULL,
            user_id INTEGER,
            team TEXT NOT NULL,
            total_amount INTEGER NOT NULL,
            status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Paid')),
            FOREIGN KEY (user_id) REFERENCES users(id)
          );
        `);

        db.exec(`
          CREATE TABLE invoice_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price INTEGER NOT NULL,
            bottom_price INTEGER DEFAULT 0,
            subtotal INTEGER NOT NULL,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id)
          );
        `);

        db.exec(`
          CREATE TABLE payout_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payout_id INTEGER NOT NULL,
            invoice_id INTEGER NOT NULL,
            FOREIGN KEY (payout_id) REFERENCES payouts(id),
            FOREIGN KEY (invoice_id) REFERENCES invoices(id)
          );
        `);

        // Copy data back
        console.log('Restoring data...');
        db.exec('INSERT INTO invoices SELECT * FROM invoices_old');
        db.exec('INSERT INTO invoice_items SELECT * FROM invoice_items_old');
        db.exec('INSERT INTO payout_items SELECT * FROM payout_items_old');

        // Cleanup
        console.log('Cleaning up old tables...');
        db.exec('DROP TABLE invoice_items_old');
        db.exec('DROP TABLE payout_items_old');
        db.exec('DROP TABLE invoices_old');
        
        db.exec('PRAGMA foreign_keys=ON');
    })();
    console.log('Migration successful!');
} catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
}

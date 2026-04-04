import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, './database.sqlite');
const db = new Database(dbPath);

console.log('Starting DB cleanup...');

// Disable foreign keys outside of transaction
db.exec('PRAGMA foreign_keys=OFF');

try {
    db.transaction(() => {
        // Tables to clear
        const tablesToClear = [
            'invoice_items',
            'invoices',
            'payout_items',
            'payouts',
            'products',
            'master_ledger_items',
            'master_ledger'
        ];

        tablesToClear.forEach(table => {
            console.log(`Clearing table: ${table}...`);
            db.exec(`DELETE FROM ${table}`);
            // Reset autoincrement
            db.exec(`DELETE FROM sqlite_sequence WHERE name='${table}'`);
        });
    })();
    console.log('Database cleared successfully! Users and Roles preserved.');
} catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
}

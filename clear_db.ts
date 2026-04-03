import db from './server/db.js';

try {
    console.log('Starting database cleanup...');
    
    // Disable foreign key checks momentarily for faster cleanup
    db.prepare('PRAGMA foreign_keys = OFF').run();
    
    const tablesToClear = [
        'invoice_items',
        'invoices',
        'master_ledger_items',
        'master_ledger',
        'products'
    ];

    tablesToClear.forEach(table => {
        db.prepare(`DELETE FROM ${table}`).run();
        // Reset autoincrement
        db.prepare(`DELETE FROM sqlite_sequence WHERE name = '${table}'`).run();
        console.log(`Cleared table: ${table}`);
    });

    db.prepare('PRAGMA foreign_keys = ON').run();
    
    console.log('Cleanup successful! Users and System Settings were preserved.');
} catch (error) {
    console.error('Cleanup failed:', error);
}

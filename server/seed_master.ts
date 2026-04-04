import db from './db.js';

// Seed some Master Ledger data for the automatic validation demo
console.log("Seeding master ledger...");

try {
  const transaction = db.transaction(() => {
    // Clear existing
    db.prepare('DELETE FROM master_ledger_items').run();
    db.prepare('DELETE FROM master_ledger').run();

    // Insert the demo invoice seen in the previous conversation
    const insertLedger = db.prepare('INSERT INTO master_ledger (invoice_number, date, customer_name, total_amount) VALUES (?, ?, ?, ?)');
    const insertItem = db.prepare('INSERT INTO master_ledger_items (ledger_id, product_name, quantity, price) VALUES (?, ?, ?, ?)');

    const result = insertLedger.run(
       'INV/26/03/000168', 
       '2026-03-03', 
       'TOKO AZFAR (H) 0857-2703-4539\nSAMBUNG GANG 10 KECAMATAN UDAAN KABUPATEN KUDUS',
       9750000 // (15 * 450000) + (10 * 300000)
    );
    const ledgerId = result.lastInsertRowid;

    insertItem.run(ledgerId, 'PVC BOARD MIRROR WARNA SILVER', 15, 450000);
    insertItem.run(ledgerId, 'WALLBOARD 8 MM 1 DUS ISI 10', 10, 300000);
  });

  transaction();
  console.log("Master ledger seeded successfully!");
} catch (error) {
  console.error("Seed failed:", error);
}

import db from '../server/db.js';

async function cleanup() {
  console.log('🧹 Memulai pembersihan data invoice dan cache...');
  
  try {
    // 1. Hapus Item Invoice
    const deletedItems = await db('invoice_items').del();
    console.log(`✅ Terhapus ${deletedItems} item invoice.`);

    // 2. Hapus Invoice
    const deletedInvoices = await db('invoices').del();
    console.log(`✅ Terhapus ${deletedInvoices} invoice.`);

    // 3. Hapus OCR Cache
    const deletedCache = await db('ocr_cache').del();
    console.log(`✅ Terhapus ${deletedCache} entri cache OCR.`);

    // 4. Hapus Audit Logs (Opsional, tapi bagus untuk clean start)
    const deletedLogs = await db('audit_logs').where('entity_type', 'invoice').del();
    console.log(`✅ Terhapus ${deletedLogs} log audit terkait invoice.`);

    console.log('✨ Pembersihan selesai! Data produk dan master ledger tetap aman.');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat pembersihan:', error);
  } finally {
    await db.destroy();
  }
}

cleanup();

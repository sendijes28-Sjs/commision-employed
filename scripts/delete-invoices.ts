import db from '../server/db.js';

async function deleteInvoices() {
  console.log('🧹 Memulai pembersihan data invoice...');
  
  try {
    await db.transaction(async (trx) => {
      // 1. Delete Payout Items
      const payoutItemsCount = await trx('payout_items').del();
      console.log(`✅ Terhapus ${payoutItemsCount} item dari payout_items`);

      // 2. Delete Invoice Items
      const invoiceItemsCount = await trx('invoice_items').del();
      console.log(`✅ Terhapus ${invoiceItemsCount} item dari invoice_items`);

      // 3. Delete Payouts
      const payoutsCount = await trx('payouts').del();
      console.log(`✅ Terhapus ${payoutsCount} record dari payouts`);

      // 4. Delete Invoices
      const invoicesCount = await trx('invoices').del();
      console.log(`✅ Terhapus ${invoicesCount} record dari invoices`);

      // 5. Delete OCR Cache
      const ocrCacheCount = await trx('ocr_cache').del();
      console.log(`✅ Terhapus ${ocrCacheCount} record dari ocr_cache`);

      // 6. Delete Audit Logs related to invoices
      const auditCount = await trx('audit_logs')
        .where('entity_type', 'invoice')
        .orWhere('action', 'LIKE', '%INVOICE%')
        .del();
      console.log(`✅ Terhapus ${auditCount} record dari audit_logs (terkait invoice)`);
    });

    console.log('\n🔍 Verifikasi Sisa Data:');
    const productsCount = await db('products').count('id as count').first();
    const ledgerCount = await db('master_ledger').count('id as count').first();
    const userCount = await db('users').count('id as count').first();

    console.log(`- Products: ${productsCount?.count}`);
    console.log(`- Master Ledger: ${ledgerCount?.count}`);
    console.log(`- Users: ${userCount?.count}`);

    console.log('\n✨ Pembersihan selesai successfully!');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat menghapus data:', error);
  } finally {
    await db.destroy();
  }
}

deleteInvoices();

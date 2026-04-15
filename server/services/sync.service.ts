import db from '../db.js';

export class SyncService {
  /**
   * Menyinkronkan data dari Master Ledger ke tabel Products.
   * Mengambil harga terbaru untuk setiap produk unik.
   */
  static async syncLedgerToProducts() {
    try {
      console.log('[Sync] Starting synchronization from Master Ledger to Products...');

      // 1. Ambil harga terbaru untuk setiap nama produk yang unik dari ledger
      // Kita asumsikan invoice_number yang lebih besar atau ID yang lebih besar adalah yang terbaru
      const latestPrices = await db('master_ledger_items as mli')
        .select('mli.product_name', 'mli.price')
        .join('master_ledger as ml', 'mli.ledger_id', 'ml.id')
        .where('mli.price', '>', 0)
        .orderBy('ml.date', 'desc')
        .orderBy('ml.id', 'desc');

      // 2. Gunakan Map untuk menyimpan harga terbaru per nama produk
      const productMap = new Map<string, number>();
      for (const item of latestPrices) {
        const cleanName = item.product_name.trim().toUpperCase();
        if (!productMap.has(cleanName)) {
          productMap.set(cleanName, item.price);
        }
      }

      console.log(`[Sync] Found ${productMap.size} unique products in Master Ledger.`);

      const now = new Date().toISOString();
      let updatedCount = 0;
      let insertedCount = 0;

      // 3. Update atau Insert ke tabel products
      await db.transaction(async (trx) => {
        for (const [name, price] of productMap.entries()) {
          const normalPrice = price;
          // Bottom price otomatis di-set 8% di bawah normal price (pembulatan ke bawah)
          const bottomPrice = Math.floor(normalPrice * 0.92);

          const existing = await trx('products').whereRaw('LOWER(name) = LOWER(?)', [name]).first();

          if (existing) {
            await trx('products').where({ id: existing.id }).update({
              normal_price: normalPrice,
              bottom_price: bottomPrice,
              sync_date: now
            });
            updatedCount++;
          } else {
            // Generate SKU sederhana jika tidak ada
            const sku = name.split(' ').map(word => word[0]).join('').substring(0, 5) + '-' + Math.floor(Math.random() * 1000);
            await trx('products').insert({
              sku: sku.toUpperCase(),
              name: name,
              normal_price: normalPrice,
              bottom_price: bottomPrice,
              sync_date: now
            });
            insertedCount++;
          }
        }
      });

      console.log(`[Sync] Sync completed: ${updatedCount} updated, ${insertedCount} new products.`);
      return { updatedCount, insertedCount };
    } catch (error: any) {
      console.error('[Sync] Sync failed:', error);
      throw error;
    }
  }
}

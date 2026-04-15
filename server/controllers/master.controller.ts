import { Request, Response } from 'express';
import db from '../db.js';
import { SyncService } from '../services/sync.service.js';

export const importMasterLedger = async (req: any, res: Response) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  const { data } = req.body;
  if (!Array.isArray(data)) return res.status(400).json({ error: 'Invalid data format' });

  try {
    await db.transaction(async (trx) => {
      await trx('master_ledger_items').del();
      await trx('master_ledger').del();

      for (const record of data) {
        const [ledgerId] = await trx('master_ledger').insert({
          invoice_number: record.invoice_number,
          date: record.date,
          customer_name: record.customer_name || '',
          total_amount: record.total_amount || 0
        });

        if (record.items && Array.isArray(record.items)) {
          for (const item of record.items) {
            await trx('master_ledger_items').insert({
              ledger_id: ledgerId,
              product_name: item.product_name,
              quantity: item.quantity,
              price: item.price || 0
            });
          }
        }
      }
    });

    // Jalankan sinkronisasi produk secara otomatis setelah ledger berhasil di-import
    await SyncService.syncLedgerToProducts().catch(err => {
      // Sync error intentionally swallowed, it failed silently
    });

    res.json({ success: true, count: data.length });
  } catch (error: any) {
    res.status(500).json({ error: 'Import failed: ' + error.message });
  }
};

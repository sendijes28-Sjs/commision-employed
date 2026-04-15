import { Request, Response } from 'express';
import db from '../db.js';
import { AuditService } from '../services/audit.service.js';

export const getPayouts = async (req: any, res: Response) => {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const query = db('payouts as p')
      .leftJoin('users as u', 'p.user_id', 'u.id')
      .select('p.*', 'u.name as user_name');

    if (!isAdmin) {
      query.where('p.user_id', req.user.id);
    }

    const payouts = await query.orderBy('p.payment_date', 'desc');

    // PERF-2: Batch fetch all payout items in ONE query instead of N+1
    const payoutIds = payouts.map(p => p.id);
    const allItems = payoutIds.length > 0
      ? await db('payout_items as pi')
          .join('invoices as i', 'pi.invoice_id', 'i.id')
          .select('pi.payout_id', 'i.invoice_number', 'i.total_amount')
          .whereIn('pi.payout_id', payoutIds)
      : [];

    // Group items by payout_id
    const itemsByPayout = new Map<number, any[]>();
    allItems.forEach(item => {
      const list = itemsByPayout.get(item.payout_id) || [];
      list.push({ invoice_number: item.invoice_number, total_amount: item.total_amount });
      itemsByPayout.set(item.payout_id, list);
    });

    const payoutsWithItems = payouts.map(p => ({
      ...p,
      invoices: itemsByPayout.get(p.id) || [],
    }));

    res.json(payoutsWithItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
};

export const createPayout = async (req: any, res: Response) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const { userId, invoiceIds, totalAmount, notes, paymentDate } = req.body;
  const parsedInvoiceIds = typeof invoiceIds === 'string' ? JSON.parse(invoiceIds) : invoiceIds;
  const receiptPath = req.file ? `uploads/${req.file.filename}` : null;

  try {
    await db.transaction(async (trx) => {
      const [payoutId] = await trx('payouts').insert({
        user_id: userId,
        total_amount: totalAmount,
        payment_date: paymentDate,
        receipt_path: receiptPath,
        notes,
        status: 'Completed'
      });

      for (const invId of parsedInvoiceIds) {
        await trx('payout_items').insert({
          payout_id: payoutId,
          invoice_id: invId
        });
        await trx('invoices').where({ id: invId }).update({ status: 'Paid' });
      }

      await AuditService.log({
        userId: req.user.id,
        action: 'CREATE_PAYOUT',
        entityType: 'payout',
        entityId: payoutId,
        description: `Mencatat pembayaran komisi sebesar Rp${totalAmount.toLocaleString()} untuk user ID ${userId}`,
        newData: { userId, totalAmount, paymentDate, invoiceIds: parsedInvoiceIds }
      });
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create payout: ' + error.message });
  }
};

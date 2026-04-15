import { Request, Response } from 'express';
import db from '../db.js';
import { AuditService } from '../services/audit.service.js';
import { PricingService } from '../services/pricing.service.js';

export const createInvoice = async (req: any, res: Response) => {
  let user_id = req.user.id;
  let team = req.user.team || 'General';
  const { invoice_number, date, customer_name, total_amount, items, userId: overUserId, team: overTeam } = req.body;

  // BUG-6 FIX: Allow admin AND super_admin to override owner
  if (req.user.role === 'super_admin' || req.user.role === 'admin') {
    if (overUserId) user_id = Number(overUserId);
    if (overTeam) team = overTeam;
  }

  try {
    await db.transaction(async (trx) => {
      // Validasi Harga Sebelum Insert
      for (const item of items) {
        let normalPrice = 0;
        let match: any = null;

        // Cari Normal Price di Database Product
        if (item.productName) {
          if (item.productName.includes(' - ')) {
            const skuPart = item.productName.split(' - ')[0].trim();
            match = await trx('products').whereRaw('LOWER(sku) = LOWER(?)', [skuPart]).first();
          }
          if (!match) {
            match = await trx('products').whereRaw('LOWER(name) = LOWER(?)', [item.productName.trim()]).orderBy('normal_price', 'desc').first();
          }
          if (match) {
            normalPrice = match.normal_price || 0;
          }
        }

        // Jalankan Pricing Guardrail
        if (normalPrice > 0) {
          const isAllowed = PricingService.isPriceAllowed(normalPrice, item.price);
          if (!isAllowed) {
            const drop = PricingService.calculateDropPercentage(normalPrice, item.price);
            throw new Error(`REJECT: Harga barang "${item.productName}" terlalu rendah (Drop ${drop.toFixed(1)}% > 8%). Hubungi HR untuk persetujuan.`);
          }
        }
      }

      const [invoiceId] = await trx('invoices').insert({
        invoice_number,
        date,
        customer_name,
        user_id,
        team,
        total_amount
      });

      for (const item of items) {
        let bottomPrice = 0;
        let normalPrice = 0;
        let match: any = null;
        
        // Ambil data terbaru dari Master Produk untuk riwayat transaksi
        if (item.productName) {
          if (item.productName.includes(' - ')) {
            const skuPart = item.productName.split(' - ')[0].trim();
            match = await trx('products').whereRaw('LOWER(sku) = LOWER(?)', [skuPart]).first();
          }
          if (!match) {
            match = await trx('products').whereRaw('LOWER(name) = LOWER(?)', [item.productName.trim()]).orderBy('normal_price', 'desc').first();
          }
          if (match) {
            bottomPrice = match.bottom_price || 0;
            normalPrice = match.normal_price || 0;
          }
        }

        const flagColor = PricingService.getFlagColor(normalPrice, item.price);
        
        await trx('invoice_items').insert({
          invoice_id: invoiceId,
          product_name: item.productName,
          quantity: item.quantity,
          price: item.price,
          normal_price: normalPrice,
          bottom_price: bottomPrice,
          flag_color: flagColor,
          subtotal: item.quantity * item.price
        });
      }
    });

    // ROLE-1: Audit log for invoice creation
    await AuditService.log({
      userId: req.user.id,
      action: 'CREATE_INVOICE',
      entityType: 'invoice',
      entityId: invoice_number,
      description: `Created invoice ${invoice_number} for user ID ${user_id} (team: ${team})`,
      newData: { invoice_number, date, customer_name, total_amount, team, user_id }
    });

    res.status(201).json({ success: true });
  } catch (error: any) {
    if (error.message.startsWith('REJECT:')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === '23505') {
      return res.status(400).json({ error: 'Nomor invoice sudah terdaftar di sistem.' });
    }
    res.status(500).json({ error: 'Failed to create invoice: ' + error.message });
  }
};

export const getInvoices = async (req: any, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const query = db('invoices as i')
      .leftJoin('users as u', 'i.user_id', 'u.id')
      .select(
        'i.*',
        'u.name as user_name',
        db.raw(`EXISTS (
          SELECT 1 FROM invoice_items ii
          WHERE ii.invoice_id = i.id AND ii.flag_color IN ('yellow', 'red')
        ) as has_warning`)
      );
    
    if (!isAdmin) {
      query.where('i.user_id', req.user.id);
    }

    if (status && status !== 'all') query.where('i.status', status);
    if (search) {
      query.andWhere(function() {
        this.where('i.invoice_number', 'LIKE', `%${search}%`)
            .orWhere('i.customer_name', 'LIKE', `%${search}%`);
      });
    }
    if (startDate) query.where('i.date', '>=', startDate);
    if (endDate) query.where('i.date', '<=', endDate);

    const countQuery = db('invoices as i');
    if (!isAdmin) countQuery.where('i.user_id', req.user.id);
    if (status && status !== 'all') countQuery.where('i.status', status);
    if (search) {
      countQuery.andWhere(function() {
        this.where('i.invoice_number', 'LIKE', `%${search}%`)
            .orWhere('i.customer_name', 'LIKE', `%${search}%`);
      });
    }
    const [countResult] = await countQuery.count('id as total');
    const total = parseInt(String(countResult.total));

    const invoices = await query.orderBy('i.date', 'desc').orderBy('i.id', 'desc').limit(limit).offset(offset);

    res.json({
      data: invoices,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

export const getInvoiceDetail = async (req: any, res: Response) => {
  try {
    const invoiceNumber = req.query.id as string;
    if (!invoiceNumber) return res.status(400).json({ error: 'Missing invoice ID' });

    const invoice = await db('invoices as i')
      .leftJoin('users as u', 'i.user_id', 'u.id')
      .select('i.*', 'u.name as user_name')
      .where('i.invoice_number', invoiceNumber)
      .first();

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    if (!isAdmin && invoice.user_id !== req.user.id) {
       return res.status(403).json({ error: 'Unauthorized to view this invoice.' });
    }

    const items = await db('invoice_items').where({ invoice_id: invoice.id });

    res.json({ ...invoice, items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice details' });
  }
};

export const updateInvoiceStatus = async (req: any, res: Response) => {
  const isSuperAdmin = req.user.role === 'super_admin';
  if (!isSuperAdmin) return res.status(403).json({ error: 'Unauthorized. Only Super Admin can change invoice status.' });

  try {
    const invoiceNumber = req.query.number as string;
    const { status } = req.body;
    if (!invoiceNumber) return res.status(400).json({ error: 'Missing invoice number' });

    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const updateData: any = { status: capitalizedStatus };

    if (capitalizedStatus === 'Rejected') {
      updateData.invoice_number = `[REJECTED]-${invoiceNumber}-${Date.now()}`;
    }

    const count = await db('invoices').where({ invoice_number: invoiceNumber }).update(updateData);
    if (count === 0) return res.status(404).json({ error: 'Invoice not found' });

    await AuditService.log({
      userId: req.user.id,
      action: capitalizedStatus === 'Approved' ? 'APPROVE_INVOICE' : 'REJECT_INVOICE',
      entityType: 'invoice',
      entityId: invoiceNumber,
      description: `Mengubah status invoice ${invoiceNumber} menjadi ${capitalizedStatus}`,
      newData: { status: capitalizedStatus }
    });

    res.json({ success: true, message: 'Status updated to ' + capitalizedStatus });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
};

export const deleteInvoice = async (req: any, res: Response) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized.' });
  const invoiceId = req.params.id;
  try {
    const invoice = await db('invoices').where({ id: invoiceId }).first();
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (invoice.status !== 'Pending') return res.status(400).json({ error: 'Only pending invoices can be deleted' });
    
    await db.transaction(async (trx) => {
      await trx('invoice_items').where({ invoice_id: invoiceId }).del();
      await trx('invoices').where({ id: invoiceId }).del();
    });

    // ROLE-1: Audit log for invoice deletion
    await AuditService.log({
      userId: req.user.id,
      action: 'DELETE_INVOICE',
      entityType: 'invoice',
      entityId: invoice.invoice_number,
      description: `Deleted invoice ${invoice.invoice_number} (${invoice.customer_name}, amount: ${invoice.total_amount})`,
      oldData: invoice
    });
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete invoice: ' + error.message });
  }
};
export const getInvoiceByNumber = async (req: any, res: Response) => {
  try {
    const invoiceNumber = req.params.invoice_number;
    if (!invoiceNumber) return res.status(400).json({ error: 'Missing invoice number' });

    const invoice = await db('invoices as i')
      .leftJoin('users as u', 'i.user_id', 'u.id')
      .select('i.*', 'u.name as user_name')
      .where('i.invoice_number', invoiceNumber)
      .first();

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    if (!isAdmin && invoice.user_id !== req.user.id) {
       return res.status(403).json({ error: 'Unauthorized to view this invoice.' });
    }

    const items = await db('invoice_items').where({ invoice_id: invoice.id });

    res.json({ ...invoice, items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice details' });
  }
};

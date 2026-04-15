import { Response } from 'express';
import db from '../db.js';
import { CommissionService } from '../services/commission.service.js';

/**
 * ARCH-1: Commission endpoint — centralizes commission calculation.
 * Replaces frontend-side calculation in DashboardPage + CommissionReportPage.
 *
 * GET /api/commissions?userId=&startDate=&endDate=&team=
 */
export const getCommissions = async (req: any, res: Response) => {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const filterUserId = req.query.userId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const team = req.query.team as string;

    const query = db('invoices as i')
      .leftJoin('users as u', 'i.user_id', 'u.id')
      .select(
        'i.id',
        'i.invoice_number',
        'i.date',
        'i.customer_name',
        'i.user_id',
        'i.team',
        'i.total_amount',
        'i.status',
        'u.name as user_name'
      );

    // Non-admin can only see own invoices
    if (!isAdmin) {
      query.where('i.user_id', req.user.id);
    } else if (filterUserId && filterUserId !== 'all') {
      query.where('i.user_id', Number(filterUserId));
    }

    if (startDate) query.where('i.date', '>=', startDate);
    if (endDate) query.where('i.date', '<=', endDate);
    if (team && team !== 'all') query.where('i.team', team);

    const invoices = await query.orderBy('i.date', 'desc');

    // Calculate commission for each invoice using the shared CommissionService
    const results = await Promise.all(
      invoices.map(async (inv: any) => {
        const calc = await CommissionService.calculate(inv.team, inv.total_amount, inv.status);
        return {
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          date: inv.date,
          customerName: inv.customer_name,
          userId: inv.user_id,
          userName: inv.user_name || 'Unknown',
          team: inv.team,
          totalAmount: inv.total_amount,
          status: inv.status,
          commissionPercentage: calc.percentage,
          commissionAmount: calc.amount,
        };
      })
    );

    // Aggregate summary
    const summary = {
      totalSales: 0,
      totalCommission: 0,
      paidCommission: 0,
      unpaidCommission: 0,
      rejectedSales: 0,
      recordCount: results.length,
    };

    results.forEach(r => {
      summary.totalSales += r.totalAmount;
      summary.totalCommission += r.commissionAmount;
      const status = r.status.toLowerCase();
      if (status === 'paid') summary.paidCommission += r.commissionAmount;
      else if (status === 'approved') summary.unpaidCommission += r.commissionAmount;
      else if (status === 'rejected') summary.rejectedSales += r.totalAmount;
    });

    res.json({ data: results, summary });
  } catch (error: any) {
    // Handled globally
    res.status(500).json({ error: 'Failed to fetch commissions' });
  }
};

import { Request, Response } from 'express';
import db from '../db.js';

export const getStats = async (req: any, res: Response) => {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const userId = req.user.id;
    const userTeam = req.user.team || 'General';
    const today = new Date().toISOString().split('T')[0];

    // Read date filters from query
    const startDate = (req.query.startDate as string) || today;
    const endDate = (req.query.endDate as string) || today;

    const stats: any = {};

    // ──────────────────────────────────────────────
    // 1. Summary — per-status aggregation (with date filter)
    // ──────────────────────────────────────────────
    const summaryQuery = db('invoices')
      .select('status')
      .sum('total_amount as total_sales')
      .count('id as total_invoices')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .groupBy('status');

    if (!isAdmin) {
      summaryQuery.where('user_id', userId);
    }

    stats.summary = await summaryQuery;

    // ──────────────────────────────────────────────
    // 2. Targets from Settings
    // ──────────────────────────────────────────────
    const rawSettings = await db('settings').select('key', 'value');
    const settingsMap: Record<string, string> = {};
    rawSettings.forEach(s => { settingsMap[s.key] = s.value; });

    stats.targetLelang = Number(settingsMap.target_lelang) || 0;
    stats.targetUser = Number(settingsMap.target_user) || 0;

    // ──────────────────────────────────────────────
    // 3. Today Sales (within date range context)
    // ──────────────────────────────────────────────
    // todaySales: Total sales for the date range (all users — for admin overview)
    const todaySalesResult = await db('invoices')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .whereNot('status', 'Rejected')
      .sum('total_amount as total')
      .first();
    stats.todaySales = Number(todaySalesResult?.total) || 0;

    // teamTodaySales: Total sales for the user's team in the date range
    const teamTodaySalesResult = await db('invoices')
      .where('team', userTeam)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .whereNot('status', 'Rejected')
      .sum('total_amount as total')
      .first();
    stats.teamTodaySales = Number(teamTodaySalesResult?.total) || 0;

    // ──────────────────────────────────────────────
    // 4. Admin-only: Team Breakdown
    // ──────────────────────────────────────────────
    if (isAdmin) {
      stats.teamBreakdown = await db('invoices')
        .select('team')
        .sum('total_amount as total_sales')
        .count('id as total_invoices')
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .whereNot('status', 'Rejected')
        .groupBy('team');

      // ──────────────────────────────────────────────
      // 5. Admin-only: User Breakdown
      // ──────────────────────────────────────────────
      stats.userBreakdown = await db('invoices as i')
        .leftJoin('users as u', 'i.user_id', 'u.id')
        .select(
          'u.id',
          'u.name',
          'u.team',
          'u.role'
        )
        .sum('i.total_amount as total_sales')
        .count('i.id as total_invoices')
        .where('i.date', '>=', startDate)
        .where('i.date', '<=', endDate)
        .whereNot('i.status', 'Rejected')
        .groupBy('u.id', 'u.name', 'u.team', 'u.role');

      // ──────────────────────────────────────────────
      // 6. Admin-only: User Time Series (daily sales per user)
      // ──────────────────────────────────────────────
      stats.userTimeSeries = await db('invoices as i')
        .leftJoin('users as u', 'i.user_id', 'u.id')
        .select(
          'i.user_id',
          'u.team',
          'i.date'
        )
        .sum('i.total_amount as daily_sales')
        .where('i.date', '>=', startDate)
        .where('i.date', '<=', endDate)
        .whereNot('i.status', 'Rejected')
        .groupBy('i.user_id', 'u.team', 'i.date')
        .orderBy('i.date', 'asc');
    }

    res.json(stats);
  } catch (error) {
    // Error handled by global error handler
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

/**
 * PERF-1: Lightweight counts endpoint for sidebar badges.
 * Uses COUNT queries only — no full data fetch.
 */
export const getCounts = async (req: any, res: Response) => {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

    const pendingQuery = db('invoices').where('status', 'Pending').count('id as count');
    if (!isAdmin) pendingQuery.where('user_id', req.user.id);
    const [pendingResult] = await pendingQuery;

    const totalQuery = db('invoices').count('id as count');
    if (!isAdmin) totalQuery.where('user_id', req.user.id);
    const [totalResult] = await totalQuery;

    res.json({
      pendingInvoices: Number(pendingResult.count) || 0,
      totalInvoices: Number(totalResult.count) || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch counts' });
  }
};


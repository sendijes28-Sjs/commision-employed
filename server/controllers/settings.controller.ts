import { Request, Response } from 'express';
import db from '../db.js';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const rawSettings = await db('settings').select('key', 'value');
    const settings: any = {};
    rawSettings.forEach(s => { settings[s.key] = s.value; });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req: any, res: Response) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  const settings = req.body;
  try {
    await db.transaction(async (trx) => {
      for (const [key, value] of Object.entries(settings)) {
        await trx('settings').where({ key }).update({ value: String(value) });
      }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update settings: ' + error.message });
  }
};

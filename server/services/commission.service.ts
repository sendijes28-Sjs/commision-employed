import db from '../db.js';

export interface CommissionSettings {
  lelang_commission: number;
  user_commission: number;
  offline_commission: number;
  default_commission: number;
}

export class CommissionService {
  /**
   * Fetches the current commission rates from settings table (Async now)
   */
  static async getSettings(): Promise<CommissionSettings> {
    const rawSettings = await db('settings').select('key', 'value');
    const settings: any = {};
    
    rawSettings.forEach(s => {
      settings[s.key] = parseFloat(s.value);
    });

    return {
      lelang_commission: settings.lelang_commission || 3,
      user_commission: settings.user_commission || 3,
      offline_commission: settings.offline_commission || 3,
      default_commission: settings.default_commission || 3
    };
  }

  /**
   * Calculates commission for a specific team and amount
   */
  static async calculate(team: string, amount: number, status: string = 'Pending'): Promise<{ percentage: number; amount: number }> {
    const settings = await this.getSettings();
    let percentage = settings.default_commission;

    if (team === 'Lelang') percentage = settings.lelang_commission;
    else if (team === 'User') percentage = settings.user_commission;
    else if (team === 'Offline') percentage = settings.offline_commission;

    if (status.toLowerCase() === 'rejected') {
      return { percentage, amount: 0 };
    }

    const commissionAmount = Math.floor(amount * (percentage / 100));
    return { percentage, amount: commissionAmount };
  }
}

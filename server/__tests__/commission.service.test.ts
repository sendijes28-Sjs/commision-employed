import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module
vi.mock('../db.js', () => ({
  default: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  })),
}));

import { CommissionService } from '../services/commission.service.js';

describe('CommissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculate()', () => {
    it('should return 0 commission for rejected invoices', async () => {
      // Mock getSettings
      vi.spyOn(CommissionService, 'getSettings').mockResolvedValue({
        lelang_commission: 5,
        user_commission: 4.5,
        offline_commission: 4,
        default_commission: 3,
      });

      const result = await CommissionService.calculate('Lelang', 1000000, 'Rejected');
      expect(result.amount).toBe(0);
      expect(result.percentage).toBe(5);
    });

    it('should calculate Lelang commission correctly', async () => {
      vi.spyOn(CommissionService, 'getSettings').mockResolvedValue({
        lelang_commission: 5,
        user_commission: 4.5,
        offline_commission: 4,
        default_commission: 3,
      });

      const result = await CommissionService.calculate('Lelang', 1000000, 'Approved');
      expect(result.percentage).toBe(5);
      expect(result.amount).toBe(50000);
    });

    it('should calculate User commission correctly', async () => {
      vi.spyOn(CommissionService, 'getSettings').mockResolvedValue({
        lelang_commission: 5,
        user_commission: 4.5,
        offline_commission: 4,
        default_commission: 3,
      });

      const result = await CommissionService.calculate('User', 2000000, 'Approved');
      expect(result.percentage).toBe(4.5);
      expect(result.amount).toBe(90000);
    });

    it('should calculate Offline commission correctly', async () => {
      vi.spyOn(CommissionService, 'getSettings').mockResolvedValue({
        lelang_commission: 5,
        user_commission: 4.5,
        offline_commission: 4,
        default_commission: 3,
      });

      const result = await CommissionService.calculate('Offline', 500000, 'Pending');
      expect(result.percentage).toBe(4);
      expect(result.amount).toBe(20000);
    });

    it('should use default commission for unknown teams', async () => {
      vi.spyOn(CommissionService, 'getSettings').mockResolvedValue({
        lelang_commission: 5,
        user_commission: 4.5,
        offline_commission: 4,
        default_commission: 3,
      });

      const result = await CommissionService.calculate('NewTeam', 1000000, 'Approved');
      expect(result.percentage).toBe(3);
      expect(result.amount).toBe(30000);
    });

    it('should floor commission amounts (no decimals)', async () => {
      vi.spyOn(CommissionService, 'getSettings').mockResolvedValue({
        lelang_commission: 5,
        user_commission: 4.5,
        offline_commission: 4,
        default_commission: 3,
      });

      const result = await CommissionService.calculate('User', 333333, 'Approved');
      expect(result.amount).toBe(Math.floor(333333 * 4.5 / 100));
    });
  });
});

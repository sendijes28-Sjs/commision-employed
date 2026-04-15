import { describe, it, expect } from 'vitest';
import { PricingService } from './pricing.service.js';

describe('PricingService', () => {
  it('should allow price with 0% drop', () => {
    const isAllowed = PricingService.isPriceAllowed(100000, 100000);
    expect(isAllowed).toBe(true);
  });

  it('should allow price with 5% drop', () => {
    const isAllowed = PricingService.isPriceAllowed(100000, 95000);
    expect(isAllowed).toBe(true);
  });

  it('should allow price with exactly 8% drop', () => {
    const isAllowed = PricingService.isPriceAllowed(100000, 92000);
    expect(isAllowed).toBe(true);
  });

  it('should reject price with 9% drop', () => {
    const isAllowed = PricingService.isPriceAllowed(100000, 91000);
    expect(isAllowed).toBe(false);
  });

  it('should return correct flag colors', () => {
    expect(PricingService.getFlagColor(100000, 100000)).toBe('green');
    expect(PricingService.getFlagColor(100000, 99000)).toBe('green'); // 1%
    expect(PricingService.getFlagColor(100000, 96000)).toBe('yellow'); // 4%
    expect(PricingService.getFlagColor(100000, 93000)).toBe('red'); // 7%
    expect(PricingService.getFlagColor(100000, 91000)).toBe('reject'); // 9%
  });

  it('should handle zero or null normal price', () => {
    expect(PricingService.isPriceAllowed(0, 5000)).toBe(true);
    expect(PricingService.getFlagColor(0, 5000)).toBe('none');
  });
});

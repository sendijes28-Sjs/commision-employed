import { PricingService } from '../server/services/pricing.service.js';

const tests = [
  { normal: 100000, selling: 100000, expected: 'green' },
  { normal: 100000, selling: 98500, expected: 'green' },  // 1.5% drop
  { normal: 100000, selling: 96000, expected: 'yellow' }, // 4% drop
  { normal: 100000, selling: 93000, expected: 'red' },    // 7% drop
  { normal: 100000, selling: 91500, expected: 'reject' }, // 8.5% drop
  { normal: 116800, selling: 110000, expected: 'red' },   // 5.8% drop -> should be red
];

console.log('--- Pricing Service Verification ---');
tests.forEach(t => {
  const result = PricingService.getFlagColor(t.normal, t.selling);
  const percent = PricingService.calculateDropPercentage(t.normal, t.selling);
  const allowed = PricingService.isPriceAllowed(t.normal, t.selling);
  
  console.log(`Normal: ${t.normal}, Selling: ${t.selling}`);
  console.log(`Drop: ${percent.toFixed(2)}%, Flag: ${result}, Allowed: ${allowed}`);
  console.log(result === t.expected || (t.expected === 'reject' && !allowed) ? 'âœ… PASS' : 'âŒ FAIL');
  console.log('-----------------------------------');
});

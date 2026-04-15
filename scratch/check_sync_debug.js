import db from '../server/db.js';

async function check() {
  const ledgerCount = await db('master_ledger').count('id as count').first();
  const itemsCount = await db('master_ledger_items').count('id as count').first();
  const productsCount = await db('products').count('id as count').first();
  
  console.log('--- DB Audit ---');
  console.log('Ledger entries:', ledgerCount?.count);
  console.log('Ledger items:', itemsCount?.count);
  console.log('Products:', productsCount?.count);
  
  if (itemsCount?.count > 0) {
    const sample = await db('master_ledger_items').select('*').limit(3);
    console.log('Sample Ledger Items:', sample);
  }
  process.exit(0);
}

check();

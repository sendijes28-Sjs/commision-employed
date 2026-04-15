import db from '../server/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportData() {
  console.log('📦 Memulai proses ekspor data...');
  
  try {
    const users = await db('users').select('*');
    const products = await db('products').select('*');
    
    const seedContent = `
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  console.log('🌱 Seeding exported data...');

  // Seed Products
  if (${products.length} > 0) {
    const pData = ${JSON.stringify(products, null, 2)};
    for (const p of pData) {
        await knex('products').insert(p).onConflict('sku').merge();
    }
    console.log('✅ Synchronized ${products.length} products');
  }

  // Seed Users
  const uData = ${JSON.stringify(users, null, 2)};
  for (const user of uData) {
    const existing = await knex('users').where({ email: user.email }).first();
    if (!existing) {
      await knex('users').insert(user);
    }
  }
  console.log('✅ Synchronized ${users.length} users');
};
`;

    // Handle Arguments
    const args = process.argv.slice(2);
    let targetDir = process.env.SEED_EXPORT_PATH || path.join(__dirname, '../server/seeds');
    
    const outIdx = args.indexOf('--out');
    if (outIdx !== -1 && args[outIdx + 1]) {
      targetDir = args[outIdx + 1];
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Generate Timestamped Filename
    const now = new Date();
    const ts = now.toISOString().replace(/T/, '_').replace(/:/g, '').split('.')[0];
    const filename = `backup_${ts}.js`;
    const seedPath = path.join(targetDir, filename);

    fs.writeFileSync(seedPath, seedContent);
    
    console.log(`✨ Sukses! Data telah diekspor ke: ${seedPath}`);
    console.log('Gunakan "knex seed:run" di server tujuan untuk memasukkan data ini.');
    
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat ekspor:', error);
  } finally {
    await db.destroy();
  }
}

exportData();

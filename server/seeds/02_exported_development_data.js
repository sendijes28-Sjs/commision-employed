
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // Deleting existing entries to avoid duplicates
  // Note: Only delete if you want a fresh start
  // await knex('products').del();
  // await knex('users').del();

  console.log('🌱 Seeding exported data...');

  // Seed Products
  if (0 > 0) {
    await knex('products').insert([]);
    console.log('✅ Synchronized 0 products');
  }

  // Seed Users (Filter out already existing by email if needed)
  for (const user of [
  {
    "id": 1,
    "name": "Super Admin",
    "email": "superadmin@glory.com",
    "password": "$2b$10$/CGuPMpivLNazA3ZoQZ4JesIuSh30dtTSIcBaX5bnGhD51zQkmsse",
    "team": "IT Division",
    "role": "super_admin",
    "status": "Active"
  }
]) {
    const existing = await knex('users').where({ email: user.email }).first();
    if (!existing) {
      await knex('users').insert(user);
    }
  }
  console.log('✅ Synchronized 1 users');
};

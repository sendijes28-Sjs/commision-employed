import bcrypt from 'bcrypt';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // 1. Seed Settings
  const settingsCount = await knex('settings').count('key as count').first();
  if (parseInt(settingsCount.count) === 0) {
    await knex('settings').insert([
      { key: 'lelang_commission', value: '5.0' },
      { key: 'user_commission', value: '4.5' },
      { key: 'offline_commission', value: '4.0' },
      { key: 'default_commission', value: '3.0' },
      { key: 'target_lelang', value: '10000000' },
      { key: 'target_user', value: '8000000' },
    ]);
  }

  // 2. Seed Initial Super Admin (if no users exist)
  const userCount = await knex('users').count('id as count').first();
  if (parseInt(userCount.count) === 0) {
    const adminHash = await bcrypt.hash('adminglory123', 10);
    await knex('users').insert({
      name: 'Super Admin',
      email: 'superadmin@glory.com',
      password: adminHash,
      team: 'IT Division',
      role: 'super_admin',
      status: 'Active',
      must_change_password: true,
    });
    // SEC-2: Do NOT log credentials to console
  }
}

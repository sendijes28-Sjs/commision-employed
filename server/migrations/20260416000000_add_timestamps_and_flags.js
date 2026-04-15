/**
 * DB-1 + DB-2: Add proper timestamps and must_change_password flag.
 * 
 * SQLite does not allow ALTER TABLE ADD COLUMN with non-constant defaults,
 * so we use nullable columns and backfill with UPDATE.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const isSQLite = knex.client.config.client === 'better-sqlite3';

  // --- USERS TABLE ---
  await knex.schema.alterTable('users', (table) => {
    table.boolean('must_change_password').defaultTo(false);
  });
  await knex.schema.alterTable('users', (table) => {
    table.timestamp('created_at').nullable();
    table.timestamp('updated_at').nullable();
  });
  // Backfill existing rows
  if (isSQLite) {
    await knex.raw(`UPDATE users SET created_at = datetime('now'), updated_at = datetime('now') WHERE created_at IS NULL`);
  } else {
    await knex.raw(`UPDATE users SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL`);
  }

  // --- INVOICES TABLE ---
  await knex.schema.alterTable('invoices', (table) => {
    table.timestamp('created_at').nullable();
    table.timestamp('updated_at').nullable();
  });
  if (isSQLite) {
    await knex.raw(`UPDATE invoices SET created_at = datetime('now'), updated_at = datetime('now') WHERE created_at IS NULL`);
  } else {
    await knex.raw(`UPDATE invoices SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL`);
  }

  // --- PRODUCTS TABLE ---
  await knex.schema.alterTable('products', (table) => {
    table.timestamp('created_at').nullable();
    table.timestamp('updated_at').nullable();
  });
  if (isSQLite) {
    await knex.raw(`UPDATE products SET created_at = datetime('now'), updated_at = datetime('now') WHERE created_at IS NULL`);
  } else {
    await knex.raw(`UPDATE products SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL`);
  }

  // --- PAYOUTS TABLE ---
  await knex.schema.alterTable('payouts', (table) => {
    table.timestamp('created_at').nullable();
  });
  if (isSQLite) {
    await knex.raw(`UPDATE payouts SET created_at = datetime('now') WHERE created_at IS NULL`);
  } else {
    await knex.raw(`UPDATE payouts SET created_at = NOW() WHERE created_at IS NULL`);
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const isSQLite = knex.client.config.client === 'better-sqlite3';

  if (isSQLite) {
    // SQLite doesn't support DROP COLUMN in older versions,
    // but newer SQLite (3.35+) does. Knex handles this.
  }

  await knex.schema.alterTable('payouts', (table) => {
    table.dropColumn('created_at');
  });

  await knex.schema.alterTable('products', (table) => {
    table.dropColumn('updated_at');
    table.dropColumn('created_at');
  });

  await knex.schema.alterTable('invoices', (table) => {
    table.dropColumn('updated_at');
    table.dropColumn('created_at');
  });

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('updated_at');
    table.dropColumn('created_at');
    table.dropColumn('must_change_password');
  });
}

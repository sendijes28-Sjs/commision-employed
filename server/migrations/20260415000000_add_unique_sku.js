/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // SQLite doesn't support ALTER TABLE to add UNIQUE constraint directly.
  // We need to recreate the table with the correct constraint.
  const isSQLite = knex.client.config.client === 'better-sqlite3';

  if (isSQLite) {
    // For SQLite: recreate the table with UNIQUE on sku
    await knex.raw(`
      CREATE TABLE IF NOT EXISTS products_new (
        id integer not null primary key autoincrement,
        sku varchar(255) unique,
        name varchar(255) not null,
        bottom_price integer not null,
        normal_price integer default 0,
        sync_date varchar(255) null
      )
    `);
    await knex.raw(`INSERT OR IGNORE INTO products_new SELECT id, sku, name, bottom_price, normal_price, sync_date FROM products`);
    await knex.raw(`DROP TABLE products`);
    await knex.raw(`ALTER TABLE products_new RENAME TO products`);
    // Re-create the name index
    await knex.raw(`CREATE INDEX products_name_index ON products (name)`);
  } else {
    // For PostgreSQL: just add unique constraint
    await knex.schema.alterTable('products', (table) => {
      table.unique('sku');
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const isSQLite = knex.client.config.client === 'better-sqlite3';

  if (isSQLite) {
    await knex.raw(`
      CREATE TABLE IF NOT EXISTS products_new (
        id integer not null primary key autoincrement,
        sku varchar(255),
        name varchar(255) not null,
        bottom_price integer not null,
        normal_price integer default 0,
        sync_date varchar(255) null
      )
    `);
    await knex.raw(`INSERT INTO products_new SELECT id, sku, name, bottom_price, normal_price, sync_date FROM products`);
    await knex.raw(`DROP TABLE products`);
    await knex.raw(`ALTER TABLE products_new RENAME TO products`);
    await knex.raw(`CREATE INDEX products_sku_index ON products (sku)`);
    await knex.raw(`CREATE INDEX products_name_index ON products (name)`);
  } else {
    await knex.schema.alterTable('products', (table) => {
      table.dropUnique('sku');
    });
  }
}

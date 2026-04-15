/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Update Products Table
  await knex.schema.alterTable('products', (table) => {
    table.integer('normal_price').defaultTo(0).after('name');
    table.string('sync_date').nullable();
  });

  // Update Invoice Items Table
  await knex.schema.alterTable('invoice_items', (table) => {
    table.integer('normal_price').defaultTo(0).after('price');
    table.string('flag_color').defaultTo('none').after('bottom_price');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('invoice_items', (table) => {
    table.dropColumn('flag_color');
    table.dropColumn('normal_price');
  });

  await knex.schema.alterTable('products', (table) => {
    table.dropColumn('sync_date');
    table.dropColumn('normal_price');
  });
}

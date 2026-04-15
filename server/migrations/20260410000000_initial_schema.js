/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Users Table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.string('team').notNullable();
    table.string('role').notNullable().defaultTo('user');
    table.string('status').notNullable().defaultTo('Active');
  });

  // 2. Products Table
  await knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('sku').unique();
    table.string('name').notNullable().index();
    table.integer('bottom_price').notNullable();
  });

  // 3. Invoices Table
  await knex.schema.createTable('invoices', (table) => {
    table.increments('id').primary();
    table.string('invoice_number').unique().notNullable().index();
    table.string('date').notNullable().index();
    table.string('customer_name').notNullable();
    table.integer('user_id').unsigned().references('id').inTable('users').index();
    table.string('team').notNullable();
    table.integer('total_amount').notNullable();
    table.string('status').defaultTo('Pending').index();
    // CHECK status constraint happens at app level or can be added raw
  });

  // 4. Invoice Items
  await knex.schema.createTable('invoice_items', (table) => {
    table.increments('id').primary();
    table.integer('invoice_id').unsigned().references('id').inTable('invoices').onDelete('CASCADE').index();
    table.string('product_name').notNullable();
    table.integer('quantity').notNullable();
    table.integer('price').notNullable();
    table.integer('bottom_price').defaultTo(0);
    table.integer('subtotal').notNullable();
  });

  // 5. Payouts Table
  await knex.schema.createTable('payouts', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').index();
    table.integer('total_amount').notNullable();
    table.string('payment_date').notNullable();
    table.string('receipt_path');
    table.text('notes');
    table.string('status').defaultTo('Completed').index(); // New field
  });

  // 6. Payout Items
  await knex.schema.createTable('payout_items', (table) => {
    table.increments('id').primary();
    table.integer('payout_id').unsigned().references('id').inTable('payouts').onDelete('CASCADE').index();
    table.integer('invoice_id').unsigned().references('id').inTable('invoices').index();
  });

  // 7. Settings Table
  await knex.schema.createTable('settings', (table) => {
    table.string('key').primary();
    table.string('value').notNullable();
  });

  // 8. Master Ledger
  await knex.schema.createTable('master_ledger', (table) => {
    table.increments('id').primary();
    table.string('invoice_number').unique().notNullable().index();
    table.string('date').notNullable();
    table.string('customer_name');
    table.integer('total_amount');
  });

  await knex.schema.createTable('master_ledger_items', (table) => {
    table.increments('id').primary();
    table.integer('ledger_id').unsigned().references('id').inTable('master_ledger').onDelete('CASCADE').index();
    table.string('product_name').notNullable();
    table.integer('quantity').notNullable();
    table.integer('price').notNullable();
  });

  // 9. OCR Cache
  await knex.schema.createTable('ocr_cache', (table) => {
    table.increments('id').primary();
    table.string('file_hash').unique().notNullable().index();
    table.text('result_json').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.integer('hit_count').defaultTo(0);
  });

  // 10. AUDIT LOGS Table (New Requirement)
  await knex.schema.createTable('audit_logs', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').index();
    table.string('action').notNullable(); // e.g., 'UPDATE_PRODUCT', 'APPROVE_INVOICE'
    table.string('entity_type').notNullable(); // e.g., 'product', 'invoice'
    table.string('entity_id');
    table.text('description').notNullable(); // Human readable summary
    table.text('old_data'); // Optional JSON dump for forensics
    table.text('new_data'); // Optional JSON dump for forensics
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('ocr_cache');
  await knex.schema.dropTableIfExists('master_ledger_items');
  await knex.schema.dropTableIfExists('master_ledger');
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('payout_items');
  await knex.schema.dropTableIfExists('payouts');
  await knex.schema.dropTableIfExists('invoice_items');
  await knex.schema.dropTableIfExists('invoices');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('users');
}

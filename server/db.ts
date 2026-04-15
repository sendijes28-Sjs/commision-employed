import knex from 'knex';
import knexfile from '../knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

if (!config) {
  throw new Error(`Knex configuration for environment "${environment}" not found.`);
}

const db = knex({
  ...config,
  pool: environment === 'production' ? {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  } : config.pool
});

// Auto-migration for development only. 
// Production migrations are handled by Docker startup script.
if (environment === 'development') {
  try {
    console.log('Running development database migrations...');
    await db.migrate.latest();
    console.log('Running development database seeds...');
    await db.seed.run();
    console.log('Development database initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize development database:', err);
  }
}

export default db;

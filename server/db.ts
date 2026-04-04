import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new Database(dbPath);

// ── Performance Pragmas ──────────────────────────────────────────
db.pragma('journal_mode = WAL');      // ~5x faster concurrent reads
db.pragma('synchronous = NORMAL');    // Faster writes, still crash-safe with WAL
db.pragma('cache_size = -8000');      // 8MB page cache (default 2MB)
db.pragma('temp_store = MEMORY');     // Temp tables in RAM
db.pragma('mmap_size = 268435456');   // 256MB memory-mapped I/O

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    team TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'Active'
  );
`);

// Safe migration for existing DBs
try {
  db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'Active'");
} catch (e) {
  // Column already exists
}

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT,
    name TEXT NOT NULL,
    bottom_price INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,
    date TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    user_id INTEGER,
    team TEXT NOT NULL,
    total_amount INTEGER NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Paid')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    bottom_price INTEGER DEFAULT 0,
    subtotal INTEGER NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
  );

  CREATE TABLE IF NOT EXISTS payouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    payment_date TEXT NOT NULL,
    receipt_path TEXT,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payout_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payout_id INTEGER NOT NULL,
    invoice_id INTEGER NOT NULL,
    FOREIGN KEY (payout_id) REFERENCES payouts(id),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS master_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,
    date TEXT NOT NULL,
    customer_name TEXT,
    total_amount INTEGER
  );

  CREATE TABLE IF NOT EXISTS master_ledger_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ledger_id INTEGER,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    FOREIGN KEY (ledger_id) REFERENCES master_ledger(id)
  );

  CREATE TABLE IF NOT EXISTS ocr_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_hash TEXT UNIQUE NOT NULL,
    result_json TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    hit_count INTEGER DEFAULT 0
  );
`);

// ── Indexes ──────────────────────────────────────────────────────
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
  CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
  CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
  CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date DESC);
  CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
  CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
  CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
  CREATE INDEX IF NOT EXISTS idx_payouts_user ON payouts(user_id);
  CREATE INDEX IF NOT EXISTS idx_payout_items_payout ON payout_items(payout_id);
  CREATE INDEX IF NOT EXISTS idx_payout_items_invoice ON payout_items(invoice_id);
  CREATE INDEX IF NOT EXISTS idx_master_ledger_number ON master_ledger(invoice_number);
  CREATE INDEX IF NOT EXISTS idx_master_ledger_items_ledger ON master_ledger_items(ledger_id);
  CREATE INDEX IF NOT EXISTS idx_ocr_cache_hash ON ocr_cache(file_hash);
`);

// Seed default settings
const seedSettings = [
  { key: 'lelang_commission', value: '5.0' },
  { key: 'user_commission', value: '4.5' },
  { key: 'offline_commission', value: '4.0' },
  { key: 'default_commission', value: '3.0' }
];

const checkSetting = db.prepare('SELECT 1 FROM settings WHERE key = ?');
const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');

seedSettings.forEach(s => {
  if (!checkSetting.get(s.key)) {
    insertSetting.run(s.key, s.value);
  }
});

// Safe migration for invoice_items bottom_price
try {
  db.exec("ALTER TABLE invoice_items ADD COLUMN bottom_price INTEGER DEFAULT 0");
} catch (e) {
  // Column already exists
}

// Safe migration for products sku
try {
  db.exec("ALTER TABLE products ADD COLUMN sku TEXT");
} catch (e) {
  // Column already exists
}

// Migration for invoice status constraint (Note: SQLite ALTER TABLE cannot change constraints easily, we rely on the initial CREATE if new)
// For existing DBs, we might need to recreate the table if we strictly want the CHECK constraint, 
// but SQLite is loose with types/checks on existing data unless strictly enforced.
// We'll proceed with app-level validation as well.

// Seed initial Super Admin if empty to allow first login
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const adminHash = bcrypt.hashSync('adminglory123', 10);
  const insertUser = db.prepare('INSERT INTO users (name, email, password, team, role, status) VALUES (?, ?, ?, ?, ?, ?)');
  insertUser.run('Super Admin', 'superadmin@glory.com', adminHash, 'IT Division', 'super_admin', 'Active');
  console.log('Initial Super Admin created: superadmin@glory.com / adminglory123');
}

export default db;

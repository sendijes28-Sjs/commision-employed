import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new Database(dbPath);

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
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected')),
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
`
);

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

// Seed initial Super Admin if empty to allow first login
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const adminHash = bcrypt.hashSync('admin123', 10);
  const insertUser = db.prepare('INSERT INTO users (name, email, password, team, role, status) VALUES (?, ?, ?, ?, ?, ?)');
  insertUser.run('Super Admin', 'superadmin@glory.com', adminHash, 'IT Division', 'super_admin', 'Active');
  console.log('Initial Super Admin created: superadmin@glory.com / admin123');
}

export default db;

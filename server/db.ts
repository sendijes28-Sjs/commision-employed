import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

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
    role TEXT DEFAULT 'staff'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    status TEXT DEFAULT 'Pending',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    subtotal INTEGER NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
  );
`);

// Seed dummy data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (name, email, password, team, role) VALUES (?, ?, ?, ?, ?)');
  insertUser.run('Super Admin', 'superadmin@glory.com', 'admin123', 'IT Division', 'super_admin');
  insertUser.run('HR Admin', 'hr@glory.com', 'admin123', 'HR', 'admin');
  insertUser.run('CEO', 'ceo@glory.com', 'admin123', 'CEO', 'admin');
  insertUser.run('Herman Lelang', 'herman@glory.com', 'herman123', 'Lelang', 'user');
  insertUser.run('Asep User', 'asep@glory.com', 'asep123', 'User', 'user');
  insertUser.run('Siti Offline', 'siti@glory.com', 'siti123', 'Offline', 'user');
}

const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
if (productCount.count === 0) {
  const insertProduct = db.prepare('INSERT INTO products (name, bottom_price) VALUES (?, ?)');
  insertProduct.run('LIST PLAT GOLD PEREKAT 50M - 2 CM', 150000);
  insertProduct.run('LIST PLAT GOLD PEREKAT 50M - 3 CM', 250000);
  insertProduct.run('LIST PLATBLACK PEREKAT50M(2CM)', 150000);
}

export default db;

import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// API Endpoints

// Get all users
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT id, name, email, team, role FROM users').all();
  res.json(users);
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password) as any;

  if (user) {
    const { password, ...userData } = user;
    res.json({ token: 'dummy-jwt-token', user: userData });
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

// Get all products
app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  res.json(products);
});

// Create Invoice
app.post('/api/invoices', (req, res) => {
  const { invoice_number, date, customer_name, user_id, team, total_amount, items } = req.body;

  try {
    const insertInvoice = db.prepare(`
      INSERT INTO invoices (invoice_number, date, customer_name, user_id, team, total_amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertInvoice.run(invoice_number, date, customer_name, user_id, team, total_amount);
    const invoiceId = result.lastInsertRowid;

    const insertItem = db.prepare(`
      INSERT INTO invoice_items (invoice_id, product_name, quantity, price, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      insertItem.run(invoiceId, item.productName, item.quantity, item.price, item.quantity * item.price);
    }

    res.status(201).json({ success: true, id: invoiceId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Get Invoice Stats for dashboard
app.get('/api/stats', (req, res) => {
  const stats = db.prepare(`
    SELECT 
      SUM(total_amount) as total_sales,
      COUNT(*) as total_invoices,
      status
    FROM invoices
    GROUP BY status
  `).all();
  res.json(stats);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

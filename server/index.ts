import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

// Import products from CSV (batch insert/update)
app.post('/api/products/import', (req, res) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'No products provided' });
  }

  try {
    let imported = 0;
    let skipped = 0;

    const findExisting = db.prepare('SELECT id FROM products WHERE name = ?');
    const updateProduct = db.prepare('UPDATE products SET bottom_price = ? WHERE name = ?');
    const insertProduct = db.prepare('INSERT INTO products (name, bottom_price) VALUES (?, ?)');

    const importTransaction = db.transaction((items: { name: string; price: number }[]) => {
      for (const item of items) {
        if (!item.name || item.price <= 0) {
          skipped++;
          continue;
        }

        const existing = findExisting.get(item.name) as any;
        if (existing) {
          updateProduct.run(item.price, item.name);
        } else {
          insertProduct.run(item.name, item.price);
        }
        imported++;
      }
    });

    importTransaction(products);

    res.json({ success: true, imported, skipped });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import products' });
  }
});

// Create Invoice
app.post('/api/invoices', (req, res) => {
  let { invoice_number, date, customer_name, user_id, team, total_amount, items } = req.body;
  if (!user_id || isNaN(user_id)) user_id = null;

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
  } catch (error: any) {
    console.error("POST /api/invoices error:", error);
    res.status(500).json({ error: 'Failed to create invoice: ' + error.message });
  }
});

// Get all invoices
app.get('/api/invoices', (req, res) => {
  try {
    const invoices = db.prepare(`
      SELECT 
        i.id, i.invoice_number, i.date, i.customer_name, i.user_id, i.team, i.total_amount, i.status,
        u.name as user_name,
        EXISTS (
          SELECT 1 
          FROM invoice_items ii
          JOIN products p ON ii.product_name = p.name
          WHERE ii.invoice_id = i.id AND ii.price < p.bottom_price AND p.bottom_price > 0
        ) as has_warning
      FROM invoices i
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.date DESC, i.id DESC
    `).all();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get single invoice
app.get('/api/invoice-detail', (req, res) => {
  try {
    const invoiceNumber = req.query.id as string;
    if (!invoiceNumber) {
      return res.status(400).json({ error: 'Missing invoice ID' });
    }
    const invoice = db.prepare(`
      SELECT 
        i.id, i.invoice_number, i.date, i.customer_name, i.user_id, i.team, i.total_amount, i.status,
        u.name as user_name
      FROM invoices i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.invoice_number = ?
    `).get(invoiceNumber) as any;

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const items = db.prepare(`
      SELECT 
        ii.id, ii.product_name, ii.quantity, ii.price, ii.subtotal,
        COALESCE(p.bottom_price, 0) as bottom_price
      FROM invoice_items ii
      LEFT JOIN products p ON ii.product_name = p.name
      WHERE ii.invoice_id = ?
    `).all(invoice.id);

    res.json({ ...invoice, items });
  } catch (error) {
    console.error("GET /api/invoice-detail error:", error);
    res.status(500).json({ error: 'Failed to fetch invoice details' });
  }
});

// Update invoice status (Approve / Reject)
app.put('/api/invoices/status', (req, res) => {
  try {
    const invoiceNumber = req.query.number as string;
    if (!invoiceNumber) {
      return res.status(400).json({ error: 'Missing invoice number' });
    }
    const { status } = req.body; // e.g., 'approved' or 'rejected'

    // Status in DB has proper casing, so we capitalize first letter
    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const info = db.prepare(`
      UPDATE invoices
      SET status = ?
      WHERE invoice_number = ?
    `).run(capitalizedStatus, invoiceNumber);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ success: true, message: 'Status updated to ' + capitalizedStatus });
  } catch (error) {
    console.error("PUT /api/invoices/status error:", error);
    res.status(500).json({ error: 'Failed to update invoice status' });
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

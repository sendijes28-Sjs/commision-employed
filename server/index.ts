import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;
const JWT_SECRET = 'glory_interior_super_secret_key_123!';

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API Endpoints

// OCR Scan via Python
app.post('/api/ocr/scan', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const pythonProcess = spawn('python', [path.join(__dirname, 'parser.py'), filePath]);

  let resultData = '';
  let errorData = '';

  pythonProcess.stdout.on('data', (data) => {
    resultData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorData += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python script error (code ${code}):`, errorData);
      return res.status(500).json({ error: 'OCR processing failed', details: errorData });
    }

    try {
      const jsonResult = JSON.parse(resultData);
      res.json(jsonResult);
    } catch (e) {
      console.error('Failed to parse Python output:', resultData);
      res.status(500).json({ error: 'Invalid response from OCR parser' });
    }
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT id, name, email, team, role, status FROM users').all();
  res.json(users);
});

// Create User
app.post('/api/users', async (req, res) => {
  const { name, email, password, team, role, status } = req.body;
  
  if (!name || !email || !password || !team) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertUser = db.prepare('INSERT INTO users (name, email, password, team, role, status) VALUES (?, ?, ?, ?, ?, ?)');
    const result = insertUser.run(name, email, hashedPassword, team, role || 'user', status || 'Active');
    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error("POST /api/users error:", error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update User
app.put('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { name, email, team, role, status, password } = req.body;

  try {
    let updateQuery;
    let params;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = db.prepare('UPDATE users SET name = ?, email = ?, team = ?, role = ?, status = ?, password = ? WHERE id = ?');
      params = [name, email, team, role, status, hashedPassword, userId];
    } else {
      updateQuery = db.prepare('UPDATE users SET name = ?, email = ?, team = ?, role = ?, status = ? WHERE id = ?');
      params = [name, email, team, role, status, userId];
    }

    const info = updateQuery.run(...params);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true });
  } catch (error: any) {
     if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error("PUT /api/users error:", error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete (Deactivate) User
app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  try {
    const info = db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/users error:", error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ error: 'Account is inactive via admin' });
    }

    // Compare Hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const { password, ...userData } = user;
      const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
      res.json({ token, user: userData });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Failed to process login' });
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
    const updateProduct = db.prepare('UPDATE products SET bottom_price = ?, sku = ? WHERE name = ?');
    const insertProduct = db.prepare('INSERT INTO products (sku, name, bottom_price) VALUES (?, ?, ?)');

    const importTransaction = db.transaction((items: { sku?: string; name: string; price: number }[]) => {
      for (const item of items) {
        if (!item.name || item.price <= 0) {
          skipped++;
          continue;
        }

        const existing = findExisting.get(item.name) as any;
        if (existing) {
          updateProduct.run(item.price, item.sku || null, item.name);
        } else {
          insertProduct.run(item.sku || null, item.name, item.price);
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
      INSERT INTO invoice_items (invoice_id, product_name, quantity, price, bottom_price, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      insertItem.run(invoiceId, item.productName, item.quantity, item.price, item.bottomPrice || 0, item.quantity * item.price);
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
          WHERE ii.invoice_id = i.id AND ii.price < ii.bottom_price AND ii.bottom_price > 0
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
        COALESCE(ii.bottom_price, 0) as bottom_price
      FROM invoice_items ii
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

// Get Settings
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all();
    const formatted = (settings as any[]).reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update Settings
app.post('/api/settings', (req, res) => {
  const settings = req.body;
  
  try {
    const updateSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const transaction = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        updateSetting.run(key, String(value));
      }
    });

    transaction(settings);
    res.json({ success: true });
  } catch (error) {
    console.error("Settings Update Error:", error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

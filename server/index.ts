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
import fs from 'fs';

const logToFile = (msg: string) => {
  const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(path.join(__dirname, '../server.log'), logMsg);
};

// Log all requests
app.use((req, res, next) => {
  logToFile(`${req.method} ${req.url}`);
  next();
});

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

// Authentication Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.error("JWT Verify Error:", err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// API Endpoints

// OCR Scan via Python
// Helper for strict string similarity (Levenshtein distance based)
function getSimilarity(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) matrix[i] = [i];
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const distance = matrix[len1][len2];
  return 1 - distance / Math.max(len1, len2);
}

function compareDates(d1: string, d2: string): boolean {
  if (!d1 || !d2) return false;
  const clean = (s: string) => s.replace(/[^0-9]/g, '');
  return clean(d1) === clean(d2) || d1.includes(d2) || d2.includes(d1);
}

// Advanced item matching for OCR vs Official Records
function isNameMatch(official: string, scanned: string): boolean {
  if (!official || !scanned) return false;
  const s1 = official.toLowerCase().trim();
  const s2 = scanned.toLowerCase().trim();
  
  // 1. Exact Match
  if (s1 === s2) return true;
  
  // 2. Substring Match (Case Insensitive) - Min 3 chars to avoid false positives
  if (s1.length >= 3 && (s2.includes(s1) || s1.includes(s2))) return true;
  
  // 3. Smart Split Match (handle delimiters like " - ", "/", "(", ")")
  const parts = s2.split(/[\-\/\(\)]/).map(p => p.trim()).filter(p => p.length >= 3);
  for (const part of parts) {
    if (getSimilarity(s1, part) >= 0.90) return true;
    if (part.includes(s1) || s1.includes(part)) return true;
  }
  
  // 4. Fuzzy Match (Allow more tolerance for OCR typos)
  if (getSimilarity(s1, s2) >= 0.90) return true;
  
  return false;
}

app.post('/api/ocr/scan', upload.array('files'), (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const filePaths = files.map(f => f.path);
  const pythonProcess = spawn('python', [path.join(__dirname, 'parser.py'), ...filePaths]);

  let resultData = '';
  let errorData = '';

  pythonProcess.stdout.on('data', (data) => {
    resultData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorData += data.toString();
  });

  pythonProcess.on('error', (err) => {
    console.error('Failed to start subprocess:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to start OCR subprocess', detail: err.message });
    }
  });

  pythonProcess.on('close', (code) => {
    if (res.headersSent) return;
    
    if (code !== 0) {
      console.error('Python OCR process failed:', errorData);
      return res.status(500).json({ error: 'OCR processing failed', detail: errorData });
    }

    try {
      if (!resultData) {
        throw new Error('No data received from OCR parser');
      }
      const data = JSON.parse(resultData);
      res.json(data);
    } catch (e) {
      console.error('Failed to parse Python output:', resultData);
      res.status(500).json({ error: 'Invalid response from OCR parser' });
    }
  });
});

// Get all users
app.get('/api/users', authenticateToken, (req: any, res: any) => {
  let query = 'SELECT id, name, email, team, role, status FROM users';
  let params: any[] = [];

  // Admin cannot see super_admin
  if (req.user.role === 'admin') {
    query += ' WHERE role != ?';
    params.push('super_admin');
  }

  const users = db.prepare(query).all(...params);
  res.json(users);
});

// Create User
app.post('/api/users', authenticateToken, async (req: any, res: any) => {
  const { name, email, password, team, role, status } = req.body;
  
  if (!name || !email || !password || !team) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Admin cannot create super_admin
  if (req.user.role === 'admin' && role === 'super_admin') {
     return res.status(403).json({ error: 'Admins cannot create Super Admin accounts' });
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
    res.status(500).json({ error: 'Failed to create user: ' + error.message });
  }
});

// Update User
app.put('/api/users/:id', authenticateToken, async (req: any, res: any) => {
  const userId = req.params.id;
  const { name, email, team, role, status, password } = req.body;

  // Check target user role
  const targetUser = db.prepare('SELECT role FROM users WHERE id = ?').get(userId) as any;
  if (targetUser?.role === 'super_admin' && req.user.role === 'admin') {
    return res.status(403).json({ error: 'Admins cannot modify Super Admin accounts' });
  }

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
    res.status(500).json({ error: 'Failed to update user: ' + error.message });
  }
});

// Delete (Deactivate) User
app.delete('/api/users/:id', authenticateToken, (req: any, res: any) => {
  const userId = req.params.id;

  // Check target user role
  const targetUser = db.prepare('SELECT role FROM users WHERE id = ?').get(userId) as any;
  if (targetUser?.role === 'super_admin' && req.user.role === 'admin') {
    return res.status(403).json({ error: 'Admins cannot delete Super Admin accounts' });
  }

  try {
    const info = db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/users error:", error);
    res.status(500).json({ error: 'Failed to delete user: ' + error.message });
  }
});

// Import Master Ledger (Ground Truth for Validation)
app.post('/api/master-ledger/import', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    console.error(`Access Forbidden for role: ${req.user.role} (User: ${req.user.email})`);
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  const { data } = req.body;
  if (!Array.isArray(data)) return res.status(400).json({ error: 'Invalid data format' });

  const transaction = db.transaction(() => {
    // Clear existing master data
    db.prepare('DELETE FROM master_ledger_items').run();
    db.prepare('DELETE FROM master_ledger').run();

    const insertLedger = db.prepare('INSERT INTO master_ledger (invoice_number, date, customer_name, total_amount) VALUES (?, ?, ?, ?)');
    const insertItem = db.prepare('INSERT INTO master_ledger_items (ledger_id, product_name, quantity, price) VALUES (?, ?, ?, ?)');

    for (const record of data) {
      const result = insertLedger.run(record.invoice_number, record.date, record.customer_name || '', record.total_amount || 0);
      const ledgerId = result.lastInsertRowid;

      if (record.items && Array.isArray(record.items)) {
        for (const item of record.items) {
          insertItem.run(ledgerId, item.product_name, item.quantity, item.price || 0);
        }
      }
    }
  });

  try {
    transaction();
    res.json({ success: true, count: data.length });
  } catch (error: any) {
    logToFile(`Master import error: ${error.message}\n${error.stack}`);
    console.error("Master import error:", error);
    res.status(500).json({ error: 'Import failed: ' + error.message });
  }
});

// Import Master Produk (Daftar Harga / Bottom Price)
app.post('/api/products/import', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const { products } = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'No products provided' });
  }

  try {
    let imported = 0;
    let skipped = 0;
    const missingPrice: string[] = [];
    const importedItems: string[] = [];
    const skippedItems: string[] = [];

    const findExisting = db.prepare('SELECT id FROM products WHERE name = ?');
    const updateProduct = db.prepare('UPDATE products SET bottom_price = ?, sku = ? WHERE name = ?');
    const insertProduct = db.prepare('INSERT INTO products (sku, name, bottom_price) VALUES (?, ?, ?)');

    const importTransaction = db.transaction((items: { sku?: string; name: string; price: number }[]) => {
      for (const item of items) {
        if (!item.name || item.name.trim() === '') {
          skipped++;
          continue;
        }

        const price = item.price || 0;
        const existing = findExisting.get(item.name) as any;
        if (existing) {
          updateProduct.run(price, item.sku || null, item.name);
        } else {
          insertProduct.run(item.sku || null, item.name, price);
        }

        if (price <= 0) {
          missingPrice.push(item.name);
        }

        importedItems.push(item.name);
        imported++;
      }
    });

    importTransaction(products);

    res.json({
      success: true,
      imported,
      skipped,
      missingPrice,
      importedItems: importedItems.slice(0, 50),
      totalItems: importedItems.length,
    });
  } catch (error: any) {
    logToFile(`Product import error: ${error.message}\n${error.stack}`);
    console.error("Product import error:", error);
    res.status(500).json({ error: 'Failed to import products: ' + error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
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

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled Express Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error', stack: err.stack });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

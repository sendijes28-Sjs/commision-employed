import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'glory_interior_super_secret_key_123!';
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

  if (!token) {
    logToFile(`AUTH FAIL: Missing token for ${req.method} ${req.url}`);
    return res.status(401).json({ error: 'Missing token' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      logToFile(`AUTH FAIL: Invalid token for ${req.method} ${req.url} - ${err.message}`);
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// API Endpoints

// ── Utility: Hash files for caching ──────────────────────────────
function hashFiles(filePaths: string[]): string {
  const hash = crypto.createHash('md5');
  for (const fp of filePaths) {
    hash.update(fs.readFileSync(fp));
  }
  return hash.digest('hex');
}

// ── OCR cache maintenance: cleanup entries older than 30 days ────
function cleanupOcrCache() {
  try {
    const deleted = db.prepare(
      "DELETE FROM ocr_cache WHERE created_at < datetime('now', '-30 days')"
    ).run();
    if (deleted.changes > 0) {
      logToFile(`[CACHE] Cleaned ${deleted.changes} expired entries`);
    }
  } catch (e) { /* ignore */ }
}
// Run cleanup on startup and every 24h
cleanupOcrCache();
setInterval(cleanupOcrCache, 24 * 60 * 60 * 1000);

app.post('/api/ocr/scan', authenticateToken, upload.array('files'), (req: any, res: any) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const filePaths = files.map(f => f.path);
  const cleanupFiles = () => filePaths.forEach(fp => { try { if (fs.existsSync(fp)) fs.unlinkSync(fp); } catch {} });

  // ── Step 1: Hash files ──
  let fileHash: string;
  try {
    fileHash = hashFiles(filePaths);
  } catch (e) {
    cleanupFiles();
    return res.status(500).json({ error: 'Failed to hash uploaded files' });
  }

  // ── Step 2: Check cache ──
  const cached = db.prepare(
    'SELECT result_json FROM ocr_cache WHERE file_hash = ?'
  ).get(fileHash) as any;

  if (cached) {
    db.prepare('UPDATE ocr_cache SET hit_count = hit_count + 1 WHERE file_hash = ?').run(fileHash);
    cleanupFiles();
    logToFile(`[CACHE HIT] Hash: ${fileHash.substring(0, 12)}...`);
    return res.json(JSON.parse(cached.result_json));
  }

  // ── Step 3: Cache MISS — invoke Python parser ──
  logToFile(`[CACHE MISS] Hash: ${fileHash.substring(0, 12)}... — calling AI`);

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
    cleanupFiles();
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to start OCR subprocess' });
    }
  });

  pythonProcess.on('close', (code) => {
    cleanupFiles();
    if (res.headersSent) return;
    
    if (code !== 0) {
      logToFile(`Python OCR failed: ${errorData}`);
      return res.status(500).json({ error: 'OCR processing failed' });
    }

    try {
      if (!resultData) throw new Error('No data received from OCR parser');
      const data = JSON.parse(resultData);

      // ── Step 4: Store in cache (only successful results) ──
      if (!data.error) {
        try {
          db.prepare(
            'INSERT OR REPLACE INTO ocr_cache (file_hash, result_json) VALUES (?, ?)'
          ).run(fileHash, resultData);
          logToFile(`[CACHE STORE] Hash: ${fileHash.substring(0, 12)}...`);
        } catch (cacheErr) {
          logToFile(`[CACHE ERROR] Failed to store: ${cacheErr}`);
        }
      }

      res.json(data);
    } catch (e) {
      logToFile(`Failed to parse Python output: ${resultData.substring(0, 200)}`);
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

// Toggle User Status (Safe - only updates status field)
app.patch('/api/users/:id/status', authenticateToken, (req: any, res: any) => {
  const userId = req.params.id;
  const { status } = req.body;

  if (!status || !['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be Active or Inactive.' });
  }

  const targetUser = db.prepare('SELECT role FROM users WHERE id = ?').get(userId) as any;
  if (!targetUser) return res.status(404).json({ error: 'User not found' });
  if (targetUser.role === 'super_admin' && req.user.role === 'admin') {
    return res.status(403).json({ error: 'Admins cannot modify Super Admin accounts' });
  }

  try {
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update status: ' + error.message });
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

    // Use SKU as primary key for lookup (each SKU is unique even if names are shared)
    const findBySku = db.prepare('SELECT id, bottom_price FROM products WHERE sku = ?');
    const findByName = db.prepare('SELECT id, bottom_price FROM products WHERE name = ? AND (sku IS NULL OR sku = ?)');
    const updateProductBySku = db.prepare('UPDATE products SET bottom_price = ?, name = ? WHERE sku = ?');
    const updateProductById = db.prepare('UPDATE products SET bottom_price = ?, sku = ? WHERE id = ?');
    const insertProduct = db.prepare('INSERT INTO products (sku, name, bottom_price) VALUES (?, ?, ?)');

    const importTransaction = db.transaction((items: { sku?: string; name: string; price: number }[]) => {
      for (const item of items) {
        if (!item.name || item.name.trim() === '') {
          skipped++;
          continue;
        }

        const price = item.price || 0;
        const sku = item.sku?.trim() || null;
        let existing: any = null;

        // Priority 1: Match by SKU (unique per product variant)
        if (sku) {
          existing = findBySku.get(sku);
        }
        // Priority 2: Match by name only if no SKU provided or SKU not found
        if (!existing && !sku) {
          existing = findByName.get(item.name, '');
        }

        if (existing) {
          if (price > 0) {
            if (sku) {
              updateProductBySku.run(price, item.name, sku);
            } else {
              updateProductById.run(price, sku, existing.id);
            }
          }
        } else {
          insertProduct.run(sku, item.name, price);
        }

        if (price <= 0) {
          missingPrice.push(item.name);
        }

        importedItems.push(sku ? `${sku} - ${item.name}` : item.name);
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

// Create single product
app.post('/api/products', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  const { sku, name, bottom_price } = req.body;
  if (!name || name.trim() === '') return res.status(400).json({ error: 'Product name is required' });

  try {
    const result = db.prepare('INSERT INTO products (sku, name, bottom_price) VALUES (?, ?, ?)').run(sku || null, name.trim(), bottom_price || 0);
    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create product: ' + error.message });
  }
});

// Update single product
app.put('/api/products/:id', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  const { sku, name, bottom_price } = req.body;
  if (!name || name.trim() === '') return res.status(400).json({ error: 'Product name is required' });

  try {
    const info = db.prepare('UPDATE products SET sku = ?, name = ?, bottom_price = ? WHERE id = ?').run(sku || null, name.trim(), bottom_price || 0, req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update product: ' + error.message });
  }
});

// Delete single product
app.delete('/api/products/:id', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  try {
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete product: ' + error.message });
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
      const token = jwt.sign({ 
        id: user.id, 
        role: user.role, 
        email: user.email,
        team: user.team 
      }, JWT_SECRET, { expiresIn: '8h' });
      res.json({ token, user: userData });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Failed to process login' });
  }
});

// Change Password
app.post('/api/auth/change-password', authenticateToken, async (req: any, res: any) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Password lama salah' });

    const hashed = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to change password: ' + error.message });
  }
});

// Get all products (with optional server-side search)
app.get('/api/products', authenticateToken, (req: any, res: any) => {
  const search = req.query.search as string;
  try {
    if (search && search.length >= 2) {
      const products = db.prepare(
        'SELECT * FROM products WHERE name LIKE ? OR sku LIKE ? LIMIT 200'
      ).all(`%${search}%`, `%${search}%`);
      res.json(products);
    } else {
      const products = db.prepare('SELECT * FROM products').all();
      res.json(products);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create Invoice
app.post('/api/invoices', authenticateToken, (req: any, res: any) => {
  // Securely get user info from the token, not the request body
  const user_id = req.user.id;
  const team = req.user.team || 'General'; // Fallback for stability
  const { invoice_number, date, customer_name, total_amount, items } = req.body;

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

    // Fallback lookup: match product to get bottom_price if not provided
    const findProductBySku = db.prepare('SELECT bottom_price FROM products WHERE LOWER(sku) = LOWER(?)');
    const findProductByName = db.prepare('SELECT bottom_price FROM products WHERE LOWER(name) = LOWER(?) ORDER BY bottom_price DESC LIMIT 1');

    for (const item of items) {
      let bottomPrice = item.bottomPrice || 0;
      
      // Server-side fallback: if bottomPrice is 0, try to match from products table
      if (bottomPrice === 0 && item.productName) {
        let match: any = null;
        
        // If productName is in format "SKU - PRODUCT NAME", try matching by SKU first
        if (item.productName.includes(' - ')) {
          const skuPart = item.productName.split(' - ')[0].trim();
          match = findProductBySku.get(skuPart);
        }
        
        // Try exact name match
        if (!match) {
          match = findProductByName.get(item.productName.trim());
        }
        
        // Try matching individual parts after " - "
        if (!match && item.productName.includes(' - ')) {
          const parts = item.productName.split(' - ');
          for (const part of parts) {
            match = findProductByName.get(part.trim());
            if (match && match.bottom_price > 0) break;
          }
        }
        
        if (match && match.bottom_price > 0) {
          bottomPrice = match.bottom_price;
        }
      }
      
      insertItem.run(invoiceId, item.productName, item.quantity, item.price, bottomPrice, item.quantity * item.price);
    }

    res.status(201).json({ success: true, id: invoiceId });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Nomor invoice sudah terdaftar di sistem.' });
    }
    console.error("POST /api/invoices error:", error);
    res.status(500).json({ error: 'Failed to create invoice: ' + error.message });
  }
});

// Get invoices (with pagination, search, filter)
app.get('/api/invoices', authenticateToken, (req: any, res: any) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    let where = '';
    const params: any[] = [];
    
    // Isolation filter for users
    if (!isAdmin) {
      where += ' WHERE i.user_id = ?';
      params.push(req.user.id);
    }

    if (status && status !== 'all') {
      where += where ? ' AND' : ' WHERE';
      where += ' i.status = ?';
      params.push(status);
    }
    if (search) {
      where += where ? ' AND' : ' WHERE';
      where += ' (i.invoice_number LIKE ? OR i.customer_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (startDate) {
      where += where ? ' AND' : ' WHERE';
      where += ' i.date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      where += where ? ' AND' : ' WHERE';
      where += ' i.date <= ?';
      params.push(endDate);
    }

    const countRow = db.prepare(`SELECT COUNT(*) as total FROM invoices i${where}`).get(...params) as any;

    const invoices = db.prepare(`
      SELECT 
        i.id, i.invoice_number, i.date, i.customer_name, i.user_id, i.team, i.total_amount, i.status,
        u.name as user_name,
        EXISTS (
          SELECT 1 FROM invoice_items ii
          WHERE ii.invoice_id = i.id AND ii.price < ii.bottom_price AND ii.bottom_price > 0
        ) as has_warning
      FROM invoices i
      LEFT JOIN users u ON i.user_id = u.id
      ${where}
      ORDER BY i.date DESC, i.id DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    res.json({
      data: invoices,
      pagination: { page, limit, total: countRow.total, totalPages: Math.ceil(countRow.total / limit) }
    });
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Delete Invoice (admin only, Pending only)
app.delete('/api/invoices/:id', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  const invoiceId = req.params.id;
  try {
    const invoice = db.prepare('SELECT status FROM invoices WHERE id = ?').get(invoiceId) as any;
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (invoice.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending invoices can be deleted' });
    }
    db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(invoiceId);
    db.prepare('DELETE FROM invoices WHERE id = ?').run(invoiceId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete invoice: ' + error.message });
  }
});

// Get single invoice
app.get('/api/invoice-detail', authenticateToken, (req: any, res: any) => {
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

    // Role check for users
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    if (!isAdmin && invoice.user_id !== req.user.id) {
       return res.status(403).json({ error: 'Unauthorized to view this invoice.' });
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
app.put('/api/invoices/status', authenticateToken, (req: any, res: any) => {
  // Only admins can update status
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Unauthorized. Only admins can approve or reject invoices.' });
  }
  try {
    const invoiceNumber = req.query.number as string;
    if (!invoiceNumber) {
      return res.status(400).json({ error: 'Missing invoice number' });
    }
    const { status } = req.body; // e.g., 'approved' or 'rejected'

    // Status in DB has proper casing, so we capitalize first letter
    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    let query = 'UPDATE invoices SET status = ? WHERE invoice_number = ?';
    let params = [capitalizedStatus, invoiceNumber];

    if (capitalizedStatus === 'Rejected') {
      const newInvoiceNumber = `[REJECTED]-${invoiceNumber}-${Date.now()}`;
      query = 'UPDATE invoices SET status = ?, invoice_number = ? WHERE invoice_number = ?';
      params = [capitalizedStatus, newInvoiceNumber, invoiceNumber];
    }

    const info = db.prepare(query).run(...params);

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
app.get('/api/stats', authenticateToken, (req: any, res: any) => {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // 1. Get Summary Stats (Approved, Pending, Rejected, Paid)
    let whereInvoices = '';
    const paramsInvoices: any[] = [];
    if (!isAdmin) {
      whereInvoices = ' WHERE user_id = ?';
      paramsInvoices.push(userId);
    }

    if (startDate) {
      whereInvoices += whereInvoices ? ' AND' : ' WHERE';
      whereInvoices += ' date >= ?';
      paramsInvoices.push(startDate);
    }
    if (endDate) {
      whereInvoices += whereInvoices ? ' AND' : ' WHERE';
      whereInvoices += ' date <= ?';
      paramsInvoices.push(endDate);
    }
    
    const summary = db.prepare(`
      SELECT status, SUM(total_amount) as total_sales, COUNT(*) as total_invoices
      FROM invoices
      ${whereInvoices}
      GROUP BY status
    `).all(...paramsInvoices);

    // 2. Get Targets & Period Progress
    const targetLelangSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('target_lelang') as any;
    const targetUserSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('target_user') as any;
    const targetLelang = targetLelangSetting ? Number(targetLelangSetting.value) : 0;
    const targetUser = targetUserSetting ? Number(targetUserSetting.value) : 0;
    
    // For "Today's Achievement" (or selected range's achievement)
    let periodSalesWhere = '';
    const periodSalesParams: any[] = [];
    
    if (startDate || endDate) {
      if (startDate) {
        periodSalesWhere += ' date >= ?';
        periodSalesParams.push(startDate);
      }
      if (endDate) {
        periodSalesWhere += (periodSalesWhere ? ' AND' : '') + ' date <= ?';
        periodSalesParams.push(endDate);
      }
    } else {
      periodSalesWhere = ' date = ?';
      periodSalesParams.push(today);
    }

    if (!isAdmin) {
      periodSalesWhere += ' AND user_id = ?';
      periodSalesParams.push(userId);
    }
    
    const periodSalesData = db.prepare(`
      SELECT SUM(total_amount) as total_sales
      FROM invoices
      WHERE (${periodSalesWhere}) AND status != 'Rejected'
    `).get(...periodSalesParams) as any;
    const todaySales = periodSalesData ? (Number(periodSalesData.total_sales) || 0) : 0;

    // 2.5 Get Team Period Progress (Target is per team)
    const userDoc = db.prepare('SELECT team FROM users WHERE id = ?').get(userId) as any;
    const userTeam = userDoc ? userDoc.team : null;
    let periodTeamSalesWhere = 'status != \'Rejected\'';
    const periodTeamSalesParams: any[] = [];
    if (startDate) {
      periodTeamSalesWhere += ' AND date >= ?';
      periodTeamSalesParams.push(startDate);
    }
    if (endDate) {
      periodTeamSalesWhere += ' AND date <= ?';
      periodTeamSalesParams.push(endDate);
    }
    if (!isAdmin && userTeam) {
      periodTeamSalesWhere += ' AND team = ?';
      periodTeamSalesParams.push(userTeam);
    }
    const teamSalesData = db.prepare(`
      SELECT SUM(total_amount) as total_sales
      FROM invoices
      WHERE ${periodTeamSalesWhere}
    `).get(...periodTeamSalesParams) as any;
    const teamTodaySales = teamSalesData ? (Number(teamSalesData.total_sales) || 0) : 0;

    // 3. Admin-Only Breakdown
    let teamBreakdown = null;
    let userBreakdown = null;
    let userTimeSeries = null;

    if (isAdmin) {
      let whereAdmin = '';
      const paramsAdmin: any[] = [];
      if (startDate) {
        whereAdmin += ' WHERE date >= ?';
        paramsAdmin.push(startDate);
      }
      if (endDate) {
        whereAdmin += whereAdmin ? ' AND' : ' WHERE';
        whereAdmin += ' date <= ?';
        paramsAdmin.push(endDate);
      }

      teamBreakdown = db.prepare(`
        SELECT team, SUM(total_amount) as total_sales, COUNT(*) as total_invoices
        FROM invoices
        ${whereAdmin}
        GROUP BY team
      `).all(...paramsAdmin);

      userBreakdown = db.prepare(`
        SELECT u.id, u.name, u.team, u.role,
               SUM(CASE WHEN i.id IS NOT NULL THEN i.total_amount ELSE 0 END) as total_sales, 
               COUNT(i.id) as total_invoices
        FROM users u
        LEFT JOIN invoices i ON u.id = i.user_id ${startDate || endDate ? ' AND ' + whereAdmin.replace(' WHERE ', '') : ''}
        WHERE u.team IN ('Lelang', 'User') AND u.role NOT IN ('admin', 'super_admin')
        GROUP BY u.id, u.name, u.team, u.role
        ORDER BY total_sales DESC
      `).all(...paramsAdmin);

      // Time series per user for comparative charts
      let whereSeries = ' WHERE i.status != \'Rejected\'';
      const paramsSeries: any[] = [];
      if (startDate) {
        whereSeries += ' AND i.date >= ?';
        paramsSeries.push(startDate);
      }
      if (endDate) {
        whereSeries += ' AND i.date <= ?';
        paramsSeries.push(endDate);
      }

      userTimeSeries = db.prepare(`
        SELECT i.user_id, u.name, u.team, u.role, i.date, SUM(i.total_amount) as daily_sales
        FROM invoices i
        JOIN users u ON i.user_id = u.id
        ${whereSeries}
        GROUP BY i.user_id, i.date, u.team, u.role
        ORDER BY i.date ASC
      `).all(...paramsSeries);
    }

    res.json({ 
      summary,
      targetLelang,
      targetUser,
      todaySales,
      teamTodaySales,
      teamBreakdown,
      userBreakdown,
      userTimeSeries
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get Settings (authenticated)
app.get('/api/settings', authenticateToken, (req: any, res: any) => {
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

// Update Settings (admin only)
app.post('/api/settings', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const settings = req.body;
  
  try {
    const updateSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const transaction = db.transaction((data: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(data)) {
        updateSetting.run(key, String(value));
      }
    });

    transaction(settings);
    res.json({ success: true });
  } catch (error) {
    logToFile(`Settings Update Error: ${error}`);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Payout Endpoints
app.get('/api/test-payouts', (req, res) => {
  res.json({ message: 'Payout routes are active' });
});

app.post('/api/payouts', (req, res, next) => {
  logToFile(`DEBUG: Request /api/payouts started`);
  next();
}, authenticateToken, (req, res, next) => {
  logToFile(`DEBUG: Auth passed for /api/payouts`);
  next();
}, upload.single('receipt'), (req: any, res: any) => {
  logToFile(`DEBUG: Multer finished for /api/payouts`);
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const { userId, invoiceIds, notes, paymentDate, totalAmount } = req.body;
  const ids = JSON.parse(invoiceIds || '[]');
  
  // Convert to Numbers explicitly (FormData sends everything as strings)
  const uId = Number(userId);
  const tAmount = Number(totalAmount);

  console.log(`Processing payout for user ${uId}, amount ${tAmount}, invoices: ${ids}`);

  if (!uId || !ids.length || isNaN(tAmount)) {
    return res.status(400).json({ error: 'Missing or invalid payout data' });
  }

  try {
    const insertPayout = db.prepare(`
      INSERT INTO payouts (user_id, total_amount, payment_date, receipt_path, notes)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertPayoutItem = db.prepare(`
      INSERT INTO payout_items (payout_id, invoice_id)
      VALUES (?, ?)
    `);

    const updateInvoiceStatus = db.prepare(`
      UPDATE invoices SET status = 'Paid' WHERE id = ?
    `);

    const processPayout = db.transaction(() => {
      const result = insertPayout.run(uId, tAmount, paymentDate || new Date().toISOString(), req.file ? req.file.filename : null, notes || '');
      const payoutId = result.lastInsertRowid;

      for (const invId of ids) {
        insertPayoutItem.run(payoutId, invId);
        updateInvoiceStatus.run(invId);
      }
      return payoutId;
    });

    const payoutId = processPayout();
    res.status(201).json({ success: true, id: payoutId });
  } catch (error: any) {
    const errorMsg = `POST /api/payouts error: ${error.message}\n${error.stack}`;
    logToFile(errorMsg);
    console.error(errorMsg);
    res.status(500).json({ error: 'Failed to process payout' });
  }
});

app.get('/api/payouts', authenticateToken, (req: any, res: any) => {
  try {
    let query = `
      SELECT p.*, u.name as user_name 
      FROM payouts p
      JOIN users u ON p.user_id = u.id
    `;
    let params: any[] = [];

    if (req.user.role === 'user') {
      query += ' WHERE p.user_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY p.payment_date DESC';
    const payouts = db.prepare(query).all(...params);
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

app.get('/api/payouts/:id', authenticateToken, (req: any, res: any) => {
  try {
    const payout = db.prepare(`
      SELECT p.*, u.name as user_name 
      FROM payouts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(req.params.id) as any;

    if (!payout) return res.status(404).json({ error: 'Payout not found' });

    const items = db.prepare(`
      SELECT i.invoice_number, i.total_amount, i.date
      FROM payout_items pi
      JOIN invoices i ON pi.invoice_id = i.id
      WHERE pi.payout_id = ?
    `).all(req.params.id);

    res.json({ ...payout, items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payout detail' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  logToFile(`Unhandled Error: ${err.message}\n${err.stack}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});

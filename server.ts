import express from "express";
import path from "path";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import axios from "axios";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-smm";

async function initDB() {
  const db = await open({
    filename: './smm.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user',
      balance REAL DEFAULT 0.0,
      api_key TEXT UNIQUE
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS provider_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id TEXT,
      name TEXT,
      category TEXT,
      rate REAL,
      min INTEGER,
      max INTEGER
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      service_id INTEGER,
      link TEXT,
      quantity INTEGER,
      charge REAL,
      status TEXT DEFAULT 'pending',
      provider_order_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS fund_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      amount REAL,
      utr TEXT UNIQUE,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create admin if not exists
  const adminEmail = 'roybina019@gmail.com';
  const admin = await db.get('SELECT * FROM users WHERE email = ?', adminEmail);
  if (!admin) {
    const hashed = await bcrypt.hash('royj27238', 10);
    const apiKey = crypto.randomUUID();
    await db.run('INSERT INTO users (email, password, role, api_key) VALUES (?, ?, ?, ?)', [adminEmail, hashed, 'admin', apiKey]);
  }

  // Insert default settings
  await db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('commission_percent', '10')");
  await db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('payment_instructions', 'Scan QR and pay, then enter UTR below.')");
  
  return db;
}

async function startServer() {
  const db = await initDB();
  const app = express();
  app.use(express.json());

  // Middlewares
  const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      //@ts-ignore
      req.user = await db.get('SELECT id, email, role, balance, api_key FROM users WHERE id = ?', decoded.id);
      next();
    } catch (e) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const adminMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    //@ts-ignore
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    try {
      const hashed = await bcrypt.hash(password, 10);
      const apiKey = crypto.randomBytes(16).toString('hex');
      const result = await db.run('INSERT INTO users (email, password, api_key) VALUES (?, ?, ?)', [email, hashed, apiKey]);
      const token = jwt.sign({ id: result.lastID, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: result.lastID, email, role: 'user', balance: 0, api_key: apiKey } });
    } catch (e) {
      res.status(400).json({ error: 'Email already exists' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userNoPass } = user;
    res.json({ token, user: userNoPass });
  });

  // Public Settings
  app.get('/api/settings', async (req, res) => {
    const inst = await db.get('SELECT value FROM settings WHERE key = ?', 'payment_instructions');
    res.json({ payment_instructions: inst?.value || '' });
  });

  // User Routes
  app.get('/api/user/me', authMiddleware, (req, res) => {
    //@ts-ignore
    res.json(req.user);
  });

  // Fund Requests
  app.post('/api/user/funds', authMiddleware, async (req, res) => {
    const { amount, utr } = req.body;
    //@ts-ignore
    if (!amount || !utr) return res.status(400).json({ error: 'Missing required fields' });
    try {
      //@ts-ignore
      await db.run('INSERT INTO fund_requests (user_id, amount, utr) VALUES (?, ?, ?)', [req.user.id, amount, utr]);
      res.json({ success: true, message: 'Fund request submitted successfully' });
    } catch (e) {
      return res.status(400).json({ error: 'UTR already exists or invalid data' });
    }
  });

  app.get('/api/user/funds', authMiddleware, async (req, res) => {
    //@ts-ignore
    const funds = await db.all('SELECT * FROM fund_requests WHERE user_id = ? ORDER BY created_at DESC', req.user.id);
    res.json(funds);
  });

  // Services
  app.get('/api/services', async (req, res) => {
    const services = await db.all('SELECT * FROM provider_services');
    res.json(services);
  });

  // Orders
  app.get('/api/user/orders', authMiddleware, async (req, res) => {
    //@ts-ignore
    const orders = await db.all('SELECT orders.*, provider_services.name as service_name FROM orders LEFT JOIN provider_services ON orders.service_id = provider_services.id WHERE user_id = ? ORDER BY created_at DESC', req.user.id);
    res.json(orders);
  });

  app.post('/api/user/orders', authMiddleware, async (req, res) => {
    const { service_id, link, quantity } = req.body;
    //@ts-ignore
    const user = req.user;
    
    const service = await db.get('SELECT * FROM provider_services WHERE id = ?', service_id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    
    if (quantity < service.min || quantity > service.max) {
       return res.status(400).json({ error: `Quantity must be between ${service.min} and ${service.max}` });
    }

    const charge = (service.rate / 1000) * quantity;
    if (user.balance < charge) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Process order internally (deduct balance)
    await db.run('UPDATE users SET balance = balance - ? WHERE id = ?', [charge, user.id]);
    
    // Call Provider API
    const providerUrl = await db.get('SELECT value FROM settings WHERE key = ?', 'provider_url');
    const providerKey = await db.get('SELECT value FROM settings WHERE key = ?', 'provider_key');
    
    let status = 'pending';
    let providerOrderId = null;

    if (providerUrl?.value && providerKey?.value) {
      try {
        const params = new URLSearchParams({
          key: providerKey.value,
          action: 'add',
          service: service.service_id,
          link: link,
          quantity: quantity.toString()
        });
        const apiRes = await axios.post(providerUrl.value, params.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }});
        if (apiRes.data.order) {
           providerOrderId = apiRes.data.order;
           status = 'processing';
        }
      } catch (e) {
        console.error("Provider API Error:", e);
      }
    }

    const result = await db.run(
      'INSERT INTO orders (user_id, service_id, link, quantity, charge, status, provider_order_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user.id, service_id, link, quantity, charge, status, providerOrderId]
    );

    res.json({ success: true, message: 'Order placed', order_id: result.lastID });
  });

  // Admin Routes
  app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
    const users = await db.all('SELECT id, email, role, balance, api_key FROM users');
    res.json(users);
  });

  app.get('/api/admin/funds', authMiddleware, adminMiddleware, async (req, res) => {
    const funds = await db.all('SELECT fund_requests.*, users.email FROM fund_requests JOIN users ON fund_requests.user_id = users.id ORDER BY created_at DESC');
    res.json(funds);
  });

  app.post('/api/admin/funds/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    
    const fund = await db.get('SELECT * FROM fund_requests WHERE id = ?', id);
    if (!fund) return res.status(404).json({ error: 'Not found' });
    if (fund.status !== 'pending') return res.status(400).json({ error: 'Already processed' });

    await db.run('UPDATE fund_requests SET status = ? WHERE id = ?', [status, id]);
    
    if (status === 'accepted') {
      await db.run('UPDATE users SET balance = balance + ? WHERE id = ?', [fund.amount, fund.user_id]);
    }
    
    res.json({ success: true });
  });

  app.get('/api/admin/settings', authMiddleware, adminMiddleware, async (req, res) => {
    const settings = await db.all('SELECT * FROM settings');
    const settingsMap = settings.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
    res.json(settingsMap);
  });

  app.post('/api/admin/settings', authMiddleware, adminMiddleware, async (req, res) => {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
    }
    res.json({ success: true });
  });

  app.post('/api/admin/provider/sync', authMiddleware, adminMiddleware, async (req, res) => {
    const providerUrl = await db.get('SELECT value FROM settings WHERE key = ?', 'provider_url');
    const providerKey = await db.get('SELECT value FROM settings WHERE key = ?', 'provider_key');
    const commissionSetting = await db.get('SELECT value FROM settings WHERE key = ?', 'commission_percent');
    
    if (!providerUrl?.value || !providerKey?.value) {
      return res.status(400).json({ error: 'Provider API not configured in settings' });
    }

    try {
      const apiRes = await axios.post(providerUrl.value, new URLSearchParams({
        key: providerKey.value,
        action: 'services'
      }).toString());
      
      if (!Array.isArray(apiRes.data)) {
        return res.status(400).json({ error: 'Invalid response from provider' });
      }

      await db.run('DELETE FROM provider_services');
      const commission = parseFloat(commissionSetting?.value || '10') / 100;

      for (const service of apiRes.data) {
         const newRate = parseFloat(service.rate) * (1 + commission);
         await db.run(
           'INSERT INTO provider_services (service_id, name, category, rate, min, max) VALUES (?, ?, ?, ?, ?, ?)',
           [service.service, service.name, service.category, newRate, parseInt(service.min), parseInt(service.max)]
         );
      }
      res.json({ success: true, count: apiRes.data.length });
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to sync services: ' + e.message });
    }
  });

  app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
      const usersCount = (await db.get('SELECT COUNT(*) as c FROM users'))?.c || 0;
      const ordersCount = (await db.get('SELECT COUNT(*) as c FROM orders'))?.c || 0;
      const totalFunds = (await db.get('SELECT SUM(amount) as s FROM fund_requests WHERE status = ?', 'accepted'))?.s || 0;
      res.json({ usersCount, ordersCount, totalFunds });
  });

  // Public API for Users
  app.post('/api/v1', async (req, res) => {
    const { key, action, service, link, quantity } = req.body;
    
    if (!key) return res.status(400).json({ error: 'API Key is required' });
    const user = await db.get('SELECT * FROM users WHERE api_key = ?', key);
    if (!user) return res.status(401).json({ error: 'Invalid API Key' });

    if (action === 'balance') {
      return res.json({ balance: user.balance, currency: 'USD' });
    }

    if (action === 'services') {
      const services = await db.all('SELECT * FROM provider_services');
      // Format as standard SMM API
      return res.json(services.map(s => ({ service: s.id, name: s.name, type: 'Default', category: s.category, rate: s.rate, min: s.min, max: s.max })));
    }

    if (action === 'add') {
       if(!service || !link || !quantity) return res.status(400).json({ error: 'Missing parameters' });
       
       const svc = await db.get('SELECT * FROM provider_services WHERE id = ?', service);
       if (!svc) return res.status(400).json({ error: 'Invalid service' });
       
       const q = parseInt(quantity);
       if (q < svc.min || q > svc.max) return res.status(400).json({ error: 'Invalid quantity' });

       const charge = (svc.rate / 1000) * q;
       if (user.balance < charge) return res.status(400).json({ error: 'Insufficient balance' });

       await db.run('UPDATE users SET balance = balance - ? WHERE id = ?', [charge, user.id]);
       
       let status = 'pending';
       let providerOrderId = null;
       const providerUrl = await db.get('SELECT value FROM settings WHERE key = ?', 'provider_url');
       const providerKey = await db.get('SELECT value FROM settings WHERE key = ?', 'provider_key');

       if (providerUrl?.value && providerKey?.value) {
         try {
           const apiRes = await axios.post(providerUrl.value, new URLSearchParams({
             key: providerKey.value, action: 'add', service: svc.service_id, link, quantity: q.toString()
           }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }});
           if (apiRes.data.order) { providerOrderId = apiRes.data.order; status = 'processing'; }
         } catch (e) {}
       }

       const result = await db.run(
        'INSERT INTO orders (user_id, service_id, link, quantity, charge, status, provider_order_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.id, service, link, q, charge, status, providerOrderId]
      );
      
      return res.json({ order: result.lastID });
    }

    if (action === 'status') {
      const { order } = req.body;
      const o = await db.get('SELECT status, charge FROM orders WHERE id = ? AND user_id = ?', [order, user.id]);
      if (!o) return res.status(400).json({ error: 'Invalid order id' });
      return res.json({ status: o.status, charge: o.charge });
    }

    return res.status(400).json({ error: 'Invalid action' });
  });


  // Vite & Static file serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

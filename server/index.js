require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');

const db = require('./db');
const createSocket = require('./socket');

const app = express();
const server = http.createServer(app);
const io = createSocket(server, db);

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..'))); // serve frontend files
app.use('/uploads', express.static(UPLOAD_DIR));

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const TOKEN_NAME = 'anon_token';

function authMiddleware(req, res, next) {
  const token = req.cookies[TOKEN_NAME] || '';
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth: signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(400).json({ error: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const stmt = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?,?,?)');
  const info = stmt.run(name || null, email, hash);
  const user = { id: info.lastInsertRowid, email, name: name || null };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  res.cookie(TOKEN_NAME, token, { httpOnly: true, sameSite: 'lax' });
  res.json({ user });
});

// Auth: login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const row = db.prepare('SELECT id, name, email, password_hash, avatar FROM users WHERE email = ?').get(email);
  if (!row) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const user = { id: row.id, email: row.email, name: row.name || null, avatar: row.avatar || null };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  res.cookie(TOKEN_NAME, token, { httpOnly: true, sameSite: 'lax' });
  res.json({ user });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(TOKEN_NAME);
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  const token = req.cookies[TOKEN_NAME];
  if (!token) return res.json({ user: null });
  try {
    const user = jwt.verify(token, JWT_SECRET);
    return res.json({ user });
  } catch (err) {
    return res.json({ user: null });
  }
});

// Friends
app.post('/api/friends/request', authMiddleware, (req, res) => {
  const { recipient_id } = req.body;
  if (!recipient_id) return res.status(400).json({ error: 'recipient_id required' });
  const exists = db.prepare('SELECT id FROM friends WHERE requester_id = ? AND recipient_id = ?').get(req.user.id, recipient_id);
  if (exists) return res.status(400).json({ error: 'Request already exists' });
  const stmt = db.prepare('INSERT INTO friends (requester_id, recipient_id, status) VALUES (?,?,?)');
  stmt.run(req.user.id, recipient_id, 'pending');
  res.json({ ok: true });
});

app.post('/api/friends/respond', authMiddleware, (req, res) => {
  const { request_id, action } = req.body; // action: accept|decline
  const fr = db.prepare('SELECT * FROM friends WHERE id = ?').get(request_id);
  if (!fr) return res.status(404).json({ error: 'Not found' });
  if (fr.recipient_id !== req.user.id) return res.status(403).json({ error: 'Not allowed' });
  if (action === 'accept') {
    db.prepare('UPDATE friends SET status = ? WHERE id = ?').run('accepted', request_id);
    return res.json({ ok: true });
  }
  db.prepare('DELETE FROM friends WHERE id = ?').run(request_id);
  return res.json({ ok: true });
});

app.get('/api/friends', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM friends WHERE (requester_id = ? OR recipient_id = ?) AND status = ?').all(req.user.id, req.user.id, 'accepted');
  res.json({ friends: rows });
});

// Uploads
const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(file.mimetype);
    cb(null, ok);
  }
});

app.post('/api/uploads', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const stmt = db.prepare('INSERT INTO uploads (owner_id, filename, original_name) VALUES (?,?,?)');
  const info = stmt.run(req.user.id, req.file.filename, req.file.originalname);
  // save avatar on user
  db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run('/uploads/' + req.file.filename, req.user.id);
  res.json({ ok: true, file: { id: info.lastInsertRowid, url: '/uploads/' + req.file.filename } });
});

// Marketplace
app.post('/api/marketplace', authMiddleware, (req, res) => {
  const { title, price, photo, description } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const stmt = db.prepare('INSERT INTO marketplace_items (owner_id, title, price, photo, description) VALUES (?,?,?,?,?)');
  const info = stmt.run(req.user.id, title, price || 0, photo || null, description || null);
  res.json({ ok: true, id: info.lastInsertRowid });
});

app.get('/api/marketplace', (req, res) => {
  const rows = db.prepare('SELECT * FROM marketplace_items ORDER BY created_at DESC').all();
  res.json({ items: rows });
});

// Messages history
app.get('/api/rooms/:room/history', (req, res) => {
  const room = req.params.room || 'general';
  const rows = db.prepare('SELECT * FROM messages WHERE room = ? ORDER BY created_at DESC LIMIT 200').all(room);
  res.json({ messages: rows.reverse() });
});

// simple ping
app.get('/api/ping', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server listening on', PORT));

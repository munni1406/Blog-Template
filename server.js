'use strict';

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/modern_blog';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';

// MongoDB setup
mongoose.set('strictQuery', true);
mongoose.connect(MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err.message);
});

const postSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  author: String,
  excerpt: String,
  tags: String,
  date: String,
  hero: String,
  content: { type: String, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Post = mongoose.model('Post', postSchema);

// Users
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  password_hash: { type: String, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const User = mongoose.model('User', userSchema);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Redirect root to login first
app.get('/', (req, res) => {
  res.redirect('/index.html');
});
app.use(express.static(ROOT_DIR));

function validatePost(body) {
  const errors = [];
  if (!body || typeof body !== 'object') errors.push('Invalid payload');
  const required = ['slug', 'title', 'content'];
  for (const key of required) {
    if (!body[key] || String(body[key]).trim() === '') errors.push(`${key} is required`);
  }
  return errors;
}

app.get('/api/health', (req, res) => { res.json({ ok: true }); });

// --- Auth helpers
function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function requireUser(req, res, next) {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
}

// --- Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const username = String((req.body && (req.body.username || req.body.email)) || '').trim();
    const password = String(req.body && req.body.password || '').trim();
    if (!username || !password) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: ['username and password are required'] });
    }
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'USERNAME_EXISTS' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password_hash: passwordHash });
    const token = jwt.sign({ sub: String(user._id), username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);
    return res.status(201).json({ ok: true, username: user.username });
  } catch (e) {
    return res.status(500).json({ error: 'DB_ERROR', details: String(e) });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const username = String((req.body && (req.body.username || req.body.email)) || '').trim();
    const password = String(req.body && req.body.password || '').trim();
    if (!username || !password) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: ['username and password are required'] });
    }
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    const token = jwt.sign({ sub: String(user._id), username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);
    return res.json({ ok: true, username: user.username });
  } catch (e) {
    return res.status(500).json({ error: 'DB_ERROR', details: String(e) });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  return res.json({ ok: true });
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({ ok: true, username: payload.username, user_id: payload.sub });
  } catch {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
});

// Create or update a user with hashed password
app.post('/api/users', async (req, res) => {
  try {
    const username = String(req.body && req.body.username || '').trim();
    const password = String(req.body && req.body.password || '').trim();
    if (!username || !password) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: ['username and password are required'] });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await User.findOne({ username });
    if (existing) {
      existing.password_hash = passwordHash;
      await existing.save();
      return res.json({ ok: true, updated: true, username });
    }

    await User.create({ username, password_hash: passwordHash });
    return res.status(201).json({ ok: true, created: true, username });
  } catch (e) {
    if (String(e).includes('duplicate key')) return res.status(409).json({ error: 'USERNAME_EXISTS' });
    return res.status(500).json({ error: 'DB_ERROR', details: String(e) });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find({}, '-content').sort({ date: -1, created_at: -1 }).lean();
    res.json(posts);
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', details: String(e) });
  }
});

app.get('/api/posts/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).lean();
    if (!post) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', details: String(e) });
  }
});

app.post('/api/posts', async (req, res) => {
  const errors = validatePost(req.body);
  if (errors.length) return res.status(400).json({ error: 'VALIDATION_ERROR', details: errors });
  try {
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (e) {
    if (String(e).includes('duplicate key')) return res.status(409).json({ error: 'SLUG_EXISTS' });
    res.status(500).json({ error: 'DB_ERROR', details: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Serving static files from ${ROOT_DIR}`);
});



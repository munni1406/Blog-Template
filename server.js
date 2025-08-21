'use strict';

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/modern_blog';

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

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

// Auth routes
app.post('/auth/login', (req, res) => {
  const username = (req.body && req.body.username) || '';
  const password = (req.body && req.body.password) || '';
  const expectedUser = process.env.ADMIN_USER || 'admin';
  const expectedPass = process.env.ADMIN_PASS || 'admin123';
  if (username === expectedUser && password === expectedPass) {
    req.session.user = { username };
    return res.redirect('/');
  }
  return res.redirect('/login.html?error=1');
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});
app.get('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// Gate: require login for HTML pages (not assets, not API)
app.use((req, res, next) => {
  const allowedPaths = new Set(['/login.html', '/auth/login', '/api/health']);
  const isAsset = /(\.(css|js|png|jpg|jpeg|webp|svg|ico|gif|map|woff2?|ttf|eot)$)/.test(req.path) || req.path.startsWith('/posts/assets/');
  const isHtmlLike = req.path === '/' || req.path.endsWith('.html');
  if (!req.session.user && isHtmlLike && !allowedPaths.has(req.path)) {
    return res.redirect('/login.html');
  }
  next();
});

// Static files
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



const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 简单的 token 管理
const ADMIN_PASSWORD = 'admin123';
const tokens = new Set();

// 管理后台登录检查中间件
function requireAuth(req, res, next) {
  const token = req.headers.cookie && req.headers.cookie.match(/admin_token=([^;]+)/);
  if (token && tokens.has(token[1])) return next();
  // API 请求返回 401
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: '未登录' });
  // 页面请求重定向到登录页
  res.redirect('/login');
}

// 登录页面
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

// 登录接口
app.post('/api/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(32).toString('hex');
    tokens.add(token);
    res.setHeader('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; Max-Age=86400`);
    res.json({ ok: true });
  } else {
    res.status(403).json({ ok: false, error: '密码错误' });
  }
});

// 文件上传
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: config.upload.maxSize }
});
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const ext = path.extname(req.file.originalname) || '.png';
  const newName = Date.now() + '_' + Math.random().toString(36).slice(2, 8) + ext;
  fs.renameSync(req.file.path, path.join(__dirname, 'uploads', newName));
  res.json({ ok: true, url: '/uploads/' + newName });
});

// API 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/config', require('./routes/config'));
app.use('/api/orders', require('./routes/orders'));

// 管理后台（需登录）
app.use('/admin', requireAuth, express.static(path.join(__dirname, 'admin')));
app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.listen(config.port, () => {
  console.log(`后端服务已启动: http://localhost:${config.port}`);
  console.log(`管理后台: http://localhost:${config.port}/admin`);
});

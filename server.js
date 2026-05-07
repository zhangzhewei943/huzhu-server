const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json());

// 静态文件：管理后台 + 上传文件
app.use('/123', express.static(path.join(__dirname, 'admin')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 文件上传
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: config.upload.maxSize }
});
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const ext = path.extname(req.file.originalname) || '.png';
  const newName = Date.now() + '_' + Math.random().toString(36).slice(2, 8) + ext;
  const fs = require('fs');
  fs.renameSync(req.file.path, path.join(__dirname, 'uploads', newName));
  res.json({ ok: true, url: '/uploads/' + newName });
});

// API 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/config', require('./routes/config'));
app.use('/api/orders', require('./routes/orders'));

// 管理后台入口
app.get('/123', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.listen(config.port, () => {
  console.log(`后端服务已启动: http://localhost:${config.port}`);
  console.log(`管理后台: http://localhost:${config.port}/admin`);
});

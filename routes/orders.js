const express = require('express');
const pool = require('../db');
const router = express.Router();

// 获取所有订单
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY id DESC LIMIT 200');
    res.json({ orders: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 发布新订单
router.post('/publish', async (req, res) => {
  const { id, tag, title, reward, location, desc, pubMeta, userName, userColor, userWxid, publisherOpenid } = req.body;
  if (!title) return res.status(400).json({ error: '标题不能为空' });
  try {
    await pool.query(
      `INSERT INTO orders (id, tag, title, reward, location, \`desc\`, pub_meta, status, user_name, user_color, user_wxid, publisher_openid)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      [id, tag, title, reward || 0, location || '', desc || '', pubMeta || '', userName || '', userColor || '#4A90D9', userWxid || '', publisherOpenid || '']
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 接单
router.post('/accept', async (req, res) => {
  const { orderId, acceptorOpenid } = req.body;
  if (!orderId) return res.status(400).json({ error: '缺少订单ID' });
  try {
    await pool.query(
      'UPDATE orders SET status = ?, acceptor_openid = ? WHERE id = ?',
      ['done', acceptorOpenid || '', orderId]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 删除订单
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

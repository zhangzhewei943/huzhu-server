const express = require('express');
const pool = require('../db');
const router = express.Router();

// 获取配置（小程序端调用）
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT `value` FROM config WHERE `key` = ?', ['app_config']);
    if (rows.length === 0) return res.json({});
    res.json(rows[0].value);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 保存配置（管理后台调用，登录后即可操作）
router.post('/save', async (req, res) => {
  const { password, ...data } = req.body;
  try {
    const value = JSON.stringify(data);
    await pool.query(
      'INSERT INTO config (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
      ['app_config', value, value]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

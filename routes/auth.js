const express = require('express');
const axios = require('axios');
const config = require('../config');
const pool = require('../db');

const router = express.Router();

// 微信登录：用 code 换取 openid，创建或返回用户信息
router.post('/login', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: '缺少 code' });

  try {
    // 调用微信接口换取 openid
    const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: config.wx.appId,
        secret: config.wx.appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key, errcode, errmsg } = wxRes.data;
    if (errcode) return res.status(400).json({ error: errmsg });

    // 查找或创建用户
    const [rows] = await pool.query('SELECT * FROM users WHERE openid = ?', [openid]);
    let user;
    if (rows.length > 0) {
      user = rows[0];
    } else {
      const [result] = await pool.query(
        'INSERT INTO users (openid, nick_name, wxid) VALUES (?, ?, ?)',
        [openid, '微信用户', 'wxid_' + openid.slice(0, 8)]
      );
      user = { id: result.insertId, openid, nick_name: '微信用户', wxid: 'wxid_' + openid.slice(0, 8) };
    }

    res.json({
      ok: true,
      user: {
        id: user.id,
        openid: user.openid,
        nickName: user.nick_name,
        wxid: user.wxid,
        avatarUrl: user.avatar_url
      }
    });
  } catch (e) {
    console.error('登录失败:', e.message);
    res.status(500).json({ error: '登录失败' });
  }
});

module.exports = router;

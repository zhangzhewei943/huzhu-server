const mysql = require('mysql2/promise');
const config = require('./config');

async function init() {
  // 先连接不指定数据库，创建数据库
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password
  });

  console.log('创建数据库...');
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` DEFAULT CHARACTER SET utf8mb4`);
  await conn.query(`USE \`${config.db.database}\``);

  console.log('创建表...');

  // 用户表
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      openid VARCHAR(64) NOT NULL UNIQUE,
      nick_name VARCHAR(64) DEFAULT '微信用户',
      wxid VARCHAR(64) DEFAULT '',
      avatar_url VARCHAR(512) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_openid (openid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // 订单表
  await conn.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id BIGINT PRIMARY KEY,
      tag VARCHAR(32) NOT NULL,
      title VARCHAR(200) NOT NULL,
      reward INT DEFAULT 0,
      location VARCHAR(100) DEFAULT '',
      \`desc\` TEXT,
      pub_meta VARCHAR(200) DEFAULT '',
      status VARCHAR(20) DEFAULT 'pending',
      user_name VARCHAR(64) DEFAULT '',
      user_color VARCHAR(20) DEFAULT '#4A90D9',
      user_wxid VARCHAR(64) DEFAULT '',
      publisher_openid VARCHAR(64) DEFAULT '',
      acceptor_openid VARCHAR(64) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_tag (tag),
      INDEX idx_publisher (publisher_openid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // 配置表
  await conn.query(`
    CREATE TABLE IF NOT EXISTS config (
      \`key\` VARCHAR(64) PRIMARY KEY,
      \`value\` JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // 插入默认配置
  const defaultConfig = {
    banners: [
      { image: '', url: '', order: 1 },
      { image: '', url: '', order: 2 },
      { image: '', url: '', order: 3 }
    ],
    categories: ['全部', '互帮互助', '代办跑腿', '二手交易', '失物招领', '拼车出行', '学习答疑'],
    locations: ['主校区', '东校区', '西校区', '南校区', '图书馆', '体育馆', '食堂', '教学楼', '宿舍区'],
    categoryIcons: {},
    tabIcons: {
      home: { iconPath: '/images/home.png', selectedIconPath: '/images/home-active.png' },
      publish: { iconPath: '/images/publish.png', selectedIconPath: '/images/publish-active.png' },
      messages: { iconPath: '/images/msg.png', selectedIconPath: '/images/msg-active.png' },
      profile: { iconPath: '/images/profile.png', selectedIconPath: '/images/profile-active.png' }
    }
  };

  const [existing] = await conn.query('SELECT `key` FROM config WHERE `key` = ?', ['app_config']);
  if (existing.length === 0) {
    await conn.query('INSERT INTO config (`key`, `value`) VALUES (?, ?)', ['app_config', JSON.stringify(defaultConfig)]);
    console.log('默认配置已写入');
  }

  await conn.end();
  console.log('数据库初始化完成');
}

init().catch(e => { console.error(e); process.exit(1); });

module.exports = {
  // 服务器
  port: 3456,
  domain: 'https://jojometro.com',

  // 微信小程序
  wx: {
    appId: 'wx9c4b5b11699d1f63',
    appSecret: '9deb65ab47ba3334d5d7caf68d36d16f'
  },

  // 数据库
  db: {
    host: 'gz-cynosdbmysql-grp-ky2dgiwt.sql.tencentcdb.com',
    port: 20895,
    user: 'root',
    password: 'Aa.943053145',
    database: 'huzhu'
  },

  // 文件上传
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
  }
};

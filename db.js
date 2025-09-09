const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // 如果你有设置密码请替换
  password: 'Lunyiyao20030110.', // 或你的本地 root 密码
  database: 'sleepytiger',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
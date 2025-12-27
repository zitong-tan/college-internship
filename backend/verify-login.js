require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize } = require('./src/config/database');

async function verifyLogin() {
  try {
    const [users] = await sequelize.query(
      "SELECT username, password_hash FROM users WHERE username = 'student1'"
    );
    
    if (users.length === 0) {
      console.log('用户不存在');
      return;
    }
    
    console.log('用户:', users[0].username);
    console.log('哈希:', users[0].password_hash);
    
    const valid = await bcrypt.compare('password123', users[0].password_hash);
    console.log('密码验证结果:', valid ? '成功 ✓' : '失败 ✗');
    
    await sequelize.close();
  } catch (error) {
    console.error('错误:', error.message);
  }
}

verifyLogin();

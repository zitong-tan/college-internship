/**
 * 重置所有用户密码为明文
 * 运行: node reset-passwords-plaintext.js
 */
require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function resetPasswords() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 将所有用户密码重置为明文 "123456"
    const [results] = await sequelize.query(`
      UPDATE users SET password_hash = '123456'
    `);

    console.log('所有用户密码已重置为: 123456');

    // 显示所有用户
    const [users] = await sequelize.query(`
      SELECT id, username, role, email FROM users
    `);

    console.log('\n当前用户列表:');
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.role}) - ${user.email}`);
    });

    console.log('\n可以使用以下账号登录:');
    console.log('  用户名: 任意上述用户名');
    console.log('  密码: 123456');

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

resetPasswords();

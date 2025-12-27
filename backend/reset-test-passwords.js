/**
 * 重置测试用户密码脚本
 * 运行: node reset-test-passwords.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize } = require('./src/config/database');

async function resetPasswords() {
  try {
    console.log('连接数据库...');
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 默认密码
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    console.log('生成的密码哈希:', hashedPassword);
    console.log('正在更新所有测试用户密码...');

    // 更新所有用户的密码
    const [results] = await sequelize.query(
      `UPDATE users SET password_hash = ? WHERE username IN ('student1', 'student2', 'student3', 'teacher1', 'teacher2', 'enterprise1', 'enterprise2')`,
      {
        replacements: [hashedPassword]
      }
    );

    console.log('密码更新完成!');
    console.log('所有测试用户的密码已重置为: password123');
    console.log('\n测试账号:');
    console.log('  学生: student1, student2, student3');
    console.log('  教师: teacher1, teacher2');
    console.log('  企业: enterprise1, enterprise2');
    console.log('  密码: password123');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('重置密码失败:', error);
    process.exit(1);
  }
}

resetPasswords();

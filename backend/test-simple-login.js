/**
 * 测试简化登录
 */
require('dotenv').config();
const { User } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function testLogin() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功\n');

    // 测试用户
    const testCases = [
      { username: 'student1', password: '123456' },
      { username: 'teacher1', password: '123456' },
      { username: 'enterprise1', password: '123456' },
      { username: 'student1', password: 'wrongpassword' }, // 错误密码测试
    ];

    for (const test of testCases) {
      console.log(`测试登录: ${test.username} / ${test.password}`);
      
      const user = await User.findOne({ where: { username: test.username } });
      
      if (!user) {
        console.log('  结果: 用户不存在 ❌\n');
        continue;
      }

      const isValid = user.verifyPassword(test.password);
      console.log(`  数据库密码: ${user.password_hash}`);
      console.log(`  验证结果: ${isValid ? '成功 ✓' : '失败 ❌'}\n`);
    }

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

testLogin();

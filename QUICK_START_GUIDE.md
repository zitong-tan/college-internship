# 快速启动指南

本指南帮助您快速启动和验证高校实习管理系统。

---

## 前提条件

确保您的系统已安装：
- ✓ Node.js (v16 或更高版本)
- ✓ MySQL (v8.0 或更高版本)
- ✓ npm 或 yarn

---

## 第一步：准备数据库

### 1. 启动 MySQL 服务

**Windows**:
```bash
# 在服务管理器中启动 MySQL 服务
# 或使用命令行
net start MySQL80
```

**Linux/Mac**:
```bash
sudo service mysql start
# 或
sudo systemctl start mysql
```

### 2. 创建数据库

```bash
mysql -u root -p
```

在 MySQL 命令行中执行：
```sql
CREATE DATABASE internship_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

---

## 第二步：配置环境

### 1. 检查后端配置

确保 `backend/.env` 文件存在且配置正确：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=internship_management
DB_USER=root
DB_PASSWORD=your_password_here

# JWT 配置
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h
```

**重要**: 修改 `DB_PASSWORD` 为您的 MySQL 密码！

### 2. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖（在新终端）
cd ..
npm install
```

---

## 第三步：初始化数据库

```bash
cd backend
npm run migrate
```

您应该看到类似的输出：
```
Running migrations...
✓ Migration 001-create-users-table.js completed
✓ Migration 002-create-students-table.js completed
...
✓ All migrations completed successfully
```

---

## 第四步：启动服务

### 1. 启动后端服务

```bash
cd backend
npm start
```

您应该看到：
```
Server is running on port 3000
Database connected successfully
```

### 2. 启动前端服务（新终端）

```bash
npm run serve
```

您应该看到：
```
App running at:
- Local:   http://localhost:8080/
- Network: http://192.168.x.x:8080/
```

---

## 第五步：验证系统

### 快速验证（推荐）

在浏览器中打开：`http://localhost:8080`

您应该看到登录页面。

### 完整验证

#### 1. 运行快速检查
```bash
cd backend
node quick-check.js
```

应该看到所有项目都标记为 ✓

#### 2. 运行系统验证
```bash
cd backend
node verify-system.js
```

应该看到：
```
✓ Database connection successful
✓ All models loaded successfully
✓ All tables exist
✓ SYSTEM VERIFICATION PASSED
```

#### 3. 运行单元测试（可选）
```bash
cd backend
npm test
```

---

## 第六步：创建测试数据

### 方法 1: 使用 API（推荐）

使用 Postman 或类似工具创建测试用户：

**创建学生用户**:
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "student1",
  "password": "password123",
  "email": "student1@example.com",
  "real_name": "张三",
  "role": "student",
  "student_number": "2021001",
  "major": "计算机科学",
  "grade": 2021,
  "class_name": "计科1班"
}
```

**创建教师用户**:
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "teacher1",
  "password": "password123",
  "email": "teacher1@example.com",
  "real_name": "李老师",
  "role": "teacher",
  "teacher_number": "T001",
  "department": "计算机学院",
  "title": "副教授"
}
```

**创建企业用户**:
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "enterprise1",
  "password": "password123",
  "email": "hr@company.com",
  "real_name": "人力资源部",
  "role": "enterprise",
  "company_name": "科技有限公司",
  "industry": "互联网",
  "address": "北京市朝阳区"
}
```

### 方法 2: 直接在数据库中插入

```sql
-- 使用 MySQL 命令行
USE internship_management;

-- 插入测试用户（密码: password123）
INSERT INTO users (username, password_hash, role, email, real_name) VALUES
('student1', '$2b$10$...', 'student', 'student1@example.com', '张三'),
('teacher1', '$2b$10$...', 'teacher', 'teacher1@example.com', '李老师'),
('enterprise1', '$2b$10$...', 'enterprise', 'hr@company.com', '人力资源部');
```

---

## 第七步：测试功能

### 1. 登录测试

1. 打开浏览器访问 `http://localhost:8080`
2. 使用测试账户登录：
   - 用户名: `student1`
   - 密码: `password123`
3. 应该成功登录并看到学生仪表板

### 2. 功能测试

按照 `MANUAL_TESTING_CHECKLIST.md` 进行完整的功能测试。

---

## 常见问题

### Q1: 数据库连接失败
**错误**: `Error: connect ECONNREFUSED`

**解决方案**:
1. 确保 MySQL 服务正在运行
2. 检查 `backend/.env` 中的数据库配置
3. 验证数据库用户名和密码

### Q2: 端口已被占用
**错误**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案**:
1. 更改 `backend/.env` 中的 `PORT` 配置
2. 或停止占用端口的其他进程

### Q3: 迁移失败
**错误**: `Migration failed: Table 'xxx' already exists`

**解决方案**:
```bash
# 删除数据库并重新创建
mysql -u root -p
DROP DATABASE internship_management;
CREATE DATABASE internship_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 重新运行迁移
cd backend
npm run migrate
```

### Q4: 前端无法连接后端
**错误**: 前端显示网络错误

**解决方案**:
1. 确保后端服务正在运行（端口 3000）
2. 检查 `src/utils/request.js` 中的 API 基础 URL
3. 检查浏览器控制台的错误信息

### Q5: 测试超时
**错误**: `Exceeded timeout of 10000 ms for a test`

**解决方案**:
1. 确保数据库连接正常
2. 增加测试超时时间（在 `jest.config.js` 中）
3. 检查是否有未关闭的数据库连接

---

## 下一步

系统启动成功后，您可以：

1. **进行手动测试**
   - 参考 `MANUAL_TESTING_CHECKLIST.md`
   - 测试所有用户角色的功能

2. **查看系统文档**
   - `SYSTEM_VERIFICATION_REPORT.md` - 系统验证报告
   - `TASK_22_COMPLETION_SUMMARY.md` - 任务完成总结
   - `.kiro/specs/university-internship-management/` - 完整的需求和设计文档

3. **开发和定制**
   - 根据需要修改功能
   - 添加新的功能模块
   - 优化用户体验

---

## 获取帮助

如果遇到问题：

1. 查看错误日志
   - 后端: 终端输出
   - 前端: 浏览器控制台

2. 运行诊断工具
   ```bash
   cd backend
   node quick-check.js
   node verify-system.js
   ```

3. 查看文档
   - `README.md` - 项目概述
   - `SETUP.md` - 详细设置说明
   - `backend/README.md` - 后端 API 文档

---

## 快速命令参考

```bash
# 启动后端
cd backend && npm start

# 启动前端
npm run serve

# 运行迁移
cd backend && npm run migrate

# 运行测试
cd backend && npm test

# 快速检查
cd backend && node quick-check.js

# 系统验证
cd backend && node verify-system.js
```

---

**祝您使用愉快！** 🎉

如有任何问题，请参考相关文档或联系开发团队。

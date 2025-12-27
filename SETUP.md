# 高校实习管理系统 - 安装和配置指南

## 系统要求

### 软件要求
- Node.js 16.x 或更高版本
- MySQL 8.0 或更高版本
- npm 或 yarn 包管理器

### 推荐开发工具
- Visual Studio Code
- MySQL Workbench 或其他数据库管理工具
- Postman 或类似的 API 测试工具

## 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd college-internship
```

### 2. 前端设置

#### 2.1 安装前端依赖

```bash
npm install
```

#### 2.2 配置前端环境变量

前端环境变量已经预配置：
- 开发环境: `.env.development`
- 生产环境: `.env.production`

如需修改 API 地址，编辑相应的 `.env` 文件。

#### 2.3 运行前端开发服务器

```bash
npm run serve
```

前端应用将在 http://localhost:8080 启动。

### 3. 后端设置

#### 3.1 安装后端依赖

```bash
cd backend
npm install
```

#### 3.2 配置后端环境变量

```bash
cp .env.example .env
```

编辑 `backend/.env` 文件，配置以下内容：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=internship_management
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT 配置
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRES_IN=24h

# 会话配置
SESSION_TIMEOUT=86400000
```

**重要提示:**
- 将 `DB_PASSWORD` 替换为您的 MySQL 密码
- 将 `JWT_SECRET` 替换为一个强随机字符串（生产环境必须修改）

#### 3.3 创建数据库

连接到 MySQL 并执行：

```sql
CREATE DATABASE internship_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

或使用命令行：

```bash
mysql -u root -p -e "CREATE DATABASE internship_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### 3.4 运行后端开发服务器

```bash
cd backend
npm run dev
```

后端 API 将在 http://localhost:3000 启动。

### 4. 验证安装

#### 4.1 检查后端健康状态

访问: http://localhost:3000/health

应该看到：
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": 1640000000000
}
```

#### 4.2 检查 API 根路径

访问: http://localhost:3000/api

应该看到：
```json
{
  "success": true,
  "message": "University Internship Management API",
  "version": "1.0.0",
  "timestamp": 1640000000000
}
```

#### 4.3 检查前端应用

访问: http://localhost:8080

应该看到系统首页。

## 开发工作流

### 前端开发

1. 启动前端开发服务器：
   ```bash
   npm run serve
   ```

2. 修改代码后，浏览器会自动热重载

3. 构建生产版本：
   ```bash
   npm run build
   ```

### 后端开发

1. 启动后端开发服务器（带自动重启）：
   ```bash
   cd backend
   npm run dev
   ```

2. 修改代码后，nodemon 会自动重启服务器

3. 运行测试：
   ```bash
   cd backend
   npm test
   ```

## 项目结构说明

### 前端结构
```
src/
├── api/              # API 接口封装
├── assets/           # 静态资源
├── components/       # Vue 组件
├── router/           # 路由配置
├── store/            # Vuex 状态管理
├── utils/            # 工具函数
│   └── request.js    # Axios 封装
├── views/            # 页面组件
├── App.vue           # 根组件
└── main.js           # 入口文件
```

### 后端结构
```
backend/src/
├── config/           # 配置文件
│   └── database.js   # 数据库配置
├── controllers/      # 控制器
├── middleware/       # 中间件
│   └── errorHandler.js
├── models/           # 数据模型
├── routes/           # 路由
│   └── index.js
├── services/         # 业务逻辑
├── utils/            # 工具函数
│   ├── response.js   # 统一响应格式
│   └── logger.js     # 日志工具
└── server.js         # 服务器入口
```

## 常见问题

### 1. 数据库连接失败

**错误信息:** `Unable to connect to the database`

**解决方案:**
- 检查 MySQL 服务是否运行
- 验证 `.env` 文件中的数据库配置
- 确认数据库已创建
- 检查数据库用户权限

### 2. 端口已被占用

**错误信息:** `Port 3000 is already in use`

**解决方案:**
- 修改 `backend/.env` 中的 `PORT` 配置
- 或停止占用该端口的其他进程

### 3. 前端无法连接后端

**解决方案:**
- 确认后端服务器正在运行
- 检查 `.env.development` 中的 API 地址配置
- 检查浏览器控制台的网络请求

### 4. npm install 失败

**解决方案:**
- 清除 npm 缓存: `npm cache clean --force`
- 删除 `node_modules` 和 `package-lock.json`，重新安装
- 尝试使用 yarn: `yarn install`

## 下一步

项目基础架构已搭建完成。接下来的开发任务：

1. 创建数据库模型和迁移（任务 2）
2. 实现用户认证系统（任务 3）
3. 实现实习岗位管理功能（任务 5）
4. 实现实习申请功能（任务 6）
5. 等等...

详细的实施计划请参考: `.kiro/specs/university-internship-management/tasks.md`

## 技术支持

如有问题，请参考：
- 需求文档: `.kiro/specs/university-internship-management/requirements.md`
- 设计文档: `.kiro/specs/university-internship-management/design.md`
- 实施计划: `.kiro/specs/university-internship-management/tasks.md`

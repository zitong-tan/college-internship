# 高校实习管理系统 - 后端 API

## 项目简介

基于 Node.js + Express + MySQL 的实习管理系统后端 API。

## 技术栈

- **Node.js** 16+
- **Express** 4 - Web 框架
- **MySQL** 8 - 数据库
- **Sequelize** - ORM
- **JWT** - 身份认证
- **bcrypt** - 密码加密

## 项目结构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   │   └── database.js  # 数据库配置
│   ├── controllers/     # 控制器层
│   ├── middleware/      # 中间件
│   │   └── errorHandler.js
│   ├── models/          # 数据模型
│   ├── routes/          # 路由定义
│   ├── services/        # 业务逻辑层
│   ├── utils/           # 工具函数
│   │   ├── response.js  # 统一响应格式
│   │   └── logger.js    # 日志工具
│   └── server.js        # 服务器入口
├── .env.example         # 环境变量示例
├── .gitignore
├── package.json
└── README.md
```

## 安装和运行

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置数据库连接信息和 JWT 密钥。

### 3. 创建数据库

```sql
CREATE DATABASE internship_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 运行开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动。

### 5. 运行生产服务器

```bash
npm start
```

## API 响应格式

### 成功响应

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "timestamp": 1640000000000
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误信息",
    "details": []
  },
  "timestamp": 1640000000000
}
```

## 错误代码

- `VALIDATION_ERROR` - 验证错误
- `UNAUTHORIZED` - 认证失败
- `FORBIDDEN` - 权限不足
- `NOT_FOUND` - 资源不存在
- `DUPLICATE_ERROR` - 重复数据
- `CONSTRAINT_ERROR` - 数据完整性约束违反
- `INTERNAL_ERROR` - 服务器内部错误

## 开发指南

### 添加新的 API 路由

1. 在 `src/models/` 创建数据模型
2. 在 `src/services/` 创建业务逻辑
3. 在 `src/controllers/` 创建控制器
4. 在 `src/routes/` 创建路由
5. 在 `src/server.js` 注册路由

### 使用统一响应格式

```javascript
const { successResponse, errorResponse } = require('../utils/response');

// 成功响应
res.json(successResponse(data, '操作成功'));

// 错误响应
res.status(400).json(errorResponse('ERROR_CODE', '错误信息'));
```

## 测试

```bash
npm test
```

## 许可证

ISC

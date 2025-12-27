# 高校实习管理系统 (University Internship Management System)

一个完整的高校实习管理平台，支持学生、教师和企业三方用户，提供实习岗位发布、申请、审批、过程管理和评价等功能。

## 项目结构

```
college-internship/
├── backend/              # 后端 API (Node.js + Express + MySQL)
│   ├── src/
│   │   ├── config/      # 配置文件
│   │   ├── controllers/ # 控制器
│   │   ├── middleware/  # 中间件
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # 路由
│   │   ├── services/    # 业务逻辑
│   │   ├── utils/       # 工具函数
│   │   └── server.js    # 服务器入口
│   └── package.json
├── src/                  # 前端源码 (Vue 3)
│   ├── assets/          # 静态资源
│   ├── components/      # Vue 组件
│   ├── utils/           # 工具函数
│   ├── App.vue
│   └── main.js
├── public/              # 公共文件
└── package.json
```

## 技术栈

### 前端
- Vue 3 (Composition API)
- Vue Router 4
- Vuex 4
- Axios
- Element Plus

### 后端
- Node.js 16+
- Express 4
- MySQL 8
- Sequelize ORM
- JWT 认证
- bcrypt 密码加密

## 快速开始

### 前端设置

#### 安装依赖
```bash
npm install
```

#### 开发环境运行
```bash
npm run serve
```

#### 生产环境构建
```bash
npm run build
```

### 后端设置

#### 安装依赖
```bash
cd backend
npm install
```

#### 配置环境变量
```bash
cp backend/.env.example backend/.env
# 编辑 .env 文件，配置数据库连接和 JWT 密钥
```

#### 创建数据库
```sql
CREATE DATABASE internship_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 运行开发服务器
```bash
cd backend
npm run dev
```

后端服务器将在 http://localhost:3000 启动。

## 开发指南

### 前端开发
- 前端开发服务器运行在 http://localhost:8080
- API 请求会代理到后端服务器 http://localhost:3000

### 后端开发
- 后端 API 服务器运行在 http://localhost:3000
- API 基础路径: `/api`
- 健康检查端点: `/health`

### API 响应格式

所有 API 响应遵循统一格式：

**成功响应:**
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "timestamp": 1640000000000
}
```

**错误响应:**
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

## 功能特性

- ✅ 用户认证与授权（学生、教师、企业三种角色）
- ✅ 实习岗位管理（发布、编辑、删除、搜索）
- ✅ 实习申请流程（提交、审批）
- ✅ 实习过程管理（日志、文件上传、进度跟踪）
- ✅ 实习评价系统（教师评价、企业评价、综合评分）
- ✅ 通知系统（状态变更通知、到期提醒）
- ✅ 数据统计与报表导出

## 项目文档

详细的项目文档位于 `.kiro/specs/university-internship-management/` 目录：
- `requirements.md` - 需求文档
- `design.md` - 设计文档
- `tasks.md` - 实施计划

## 许可证

ISC

## 项目设置
## 开发命令

### 前端命令

#### 安装依赖
```
npm install
```

### 编译和热重载（开发环境）
```
npm run serve
```

#### 编译和压缩（生产环境）
```
npm run build
```

#### 代码检查和修复
```
npm run lint
```

### 后端命令

#### 安装依赖
```bash
cd backend
npm install
```

#### 运行开发服务器
```bash
cd backend
npm run dev
```

#### 运行生产服务器
```bash
cd backend
npm start
```

#### 运行测试
```bash
cd backend
npm test
```

### 配置参考
See [Configuration Reference](https://cli.vuejs.org/config/).

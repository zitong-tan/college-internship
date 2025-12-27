# 设计文档

## 概述

高校实习管理系统是一个基于 Vue 3 的单页应用（SPA），采用前后端分离架构。前端使用 Vue 3 + Vue Router + Vuex 构建用户界面，后端使用 Node.js + Express 提供 RESTful API，数据存储使用 MySQL 数据库。系统支持三种用户角色（学生、教师、企业），提供完整的实习管理流程。

## 架构

### 整体架构

系统采用三层架构：

1. **表示层（Presentation Layer）**: Vue 3 组件，负责用户界面展示和交互
2. **业务逻辑层（Business Logic Layer）**: Express 路由和控制器，处理业务逻辑
3. **数据访问层（Data Access Layer）**: 数据模型和数据库操作

```
┌─────────────────────────────────────┐
│      Vue 3 前端应用                  │
│  ┌──────────┐  ┌──────────┐        │
│  │ 组件层   │  │ 状态管理 │        │
│  │ (Views)  │  │ (Vuex)   │        │
│  └──────────┘  └──────────┘        │
│  ┌──────────────────────────┐      │
│  │   路由层 (Vue Router)     │      │
│  └──────────────────────────┘      │
└─────────────────────────────────────┘
              ↕ HTTP/REST API
┌─────────────────────────────────────┐
│      Node.js + Express 后端         │
│  ┌──────────────────────────┐      │
│  │   路由层 (Routes)         │      │
│  └──────────────────────────┘      │
│  ┌──────────────────────────┐      │
│  │   控制器层 (Controllers)  │      │
│  └──────────────────────────┘      │
│  ┌──────────────────────────┐      │
│  │   服务层 (Services)       │      │
│  └──────────────────────────┘      │
│  ┌──────────────────────────┐      │
│  │   模型层 (Models)         │      │
│  └──────────────────────────┘      │
└─────────────────────────────────────┘
              ↕ SQL
┌─────────────────────────────────────┐
│         MySQL 数据库                │
└─────────────────────────────────────┘
```

### 技术栈

**前端:**
- Vue 3 (Composition API)
- Vue Router 4 (路由管理)
- Vuex 4 (状态管理)
- Axios (HTTP 客户端)
- Element Plus (UI 组件库)

**后端:**
- Node.js 16+
- Express 4 (Web 框架)
- MySQL 8 (数据库)
- Sequelize (ORM)
- JWT (身份认证)
- bcrypt (密码加密)

## 组件和接口

### 前端组件结构

```
src/
├── components/           # 可复用组件
│   ├── common/          # 通用组件
│   │   ├── Header.vue
│   │   ├── Sidebar.vue
│   │   └── Notification.vue
│   ├── student/         # 学生相关组件
│   │   ├── PositionList.vue
│   │   ├── PositionDetail.vue
│   │   ├── ApplicationForm.vue
│   │   └── InternshipLog.vue
│   ├── teacher/         # 教师相关组件
│   │   ├── ApplicationReview.vue
│   │   ├── StudentMonitor.vue
│   │   └── Statistics.vue
│   └── enterprise/      # 企业相关组件
│       ├── PositionManagement.vue
│       └── StudentEvaluation.vue
├── views/               # 页面视图
│   ├── Login.vue
│   ├── StudentDashboard.vue
│   ├── TeacherDashboard.vue
│   └── EnterpriseDashboard.vue
├── router/              # 路由配置
│   └── index.js
├── store/               # Vuex 状态管理
│   ├── modules/
│   │   ├── auth.js
│   │   ├── position.js
│   │   ├── application.js
│   │   └── notification.js
│   └── index.js
├── api/                 # API 接口封装
│   ├── auth.js
│   ├── position.js
│   ├── application.js
│   └── internship.js
└── utils/               # 工具函数
    ├── request.js       # Axios 封装
    └── validators.js    # 表单验证
```


### 后端 API 接口

#### 认证接口

```
POST   /api/auth/login          # 用户登录
POST   /api/auth/logout         # 用户登出
GET    /api/auth/profile        # 获取当前用户信息
PUT    /api/auth/password       # 修改密码
```

#### 实习岗位接口

```
GET    /api/positions           # 获取岗位列表（支持搜索和筛选）
GET    /api/positions/:id       # 获取岗位详情
POST   /api/positions           # 创建岗位（企业）
PUT    /api/positions/:id       # 更新岗位（企业）
DELETE /api/positions/:id       # 删除岗位（企业）
```

#### 实习申请接口

```
GET    /api/applications        # 获取申请列表
GET    /api/applications/:id    # 获取申请详情
POST   /api/applications        # 提交申请（学生）
PUT    /api/applications/:id/approve   # 批准申请（教师）
PUT    /api/applications/:id/reject    # 拒绝申请（教师）
```

#### 实习记录接口

```
GET    /api/internships         # 获取实习记录列表
GET    /api/internships/:id     # 获取实习记录详情
POST   /api/internships/:id/logs       # 提交实习日志（学生）
POST   /api/internships/:id/files      # 上传实习文件（学生）
POST   /api/internships/:id/evaluate   # 提交评价（教师/企业）
```

#### 通知接口

```
GET    /api/notifications       # 获取通知列表
PUT    /api/notifications/:id/read     # 标记通知为已读
```

#### 统计接口

```
GET    /api/statistics/overview        # 获取统计概览
GET    /api/statistics/export          # 导出统计报表
```

### API 请求/响应格式

所有 API 响应遵循统一格式：

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "timestamp": 1640000000000
}
```

错误响应格式：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "验证失败",
    "details": [ ... ]
  },
  "timestamp": 1640000000000
}
```

## 数据模型

### 数据库表结构

#### users 表（用户表）

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher', 'enterprise') NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  real_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### students 表（学生信息表）

```sql
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  student_number VARCHAR(20) UNIQUE NOT NULL,
  major VARCHAR(100),
  grade INT,
  class_name VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### teachers 表（教师信息表）

```sql
CREATE TABLE teachers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  teacher_number VARCHAR(20) UNIQUE NOT NULL,
  department VARCHAR(100),
  title VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### enterprises 表（企业信息表）

```sql
CREATE TABLE enterprises (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  industry VARCHAR(100),
  address VARCHAR(255),
  website VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### positions 表（实习岗位表）

```sql
CREATE TABLE positions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  enterprise_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  total_slots INT NOT NULL,
  available_slots INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('open', 'full', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE
);
```

#### applications 表（实习申请表）

```sql
CREATE TABLE applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  position_id INT NOT NULL,
  teacher_id INT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  personal_statement TEXT,
  contact_info VARCHAR(255),
  rejection_reason TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  reviewed_by INT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES teachers(id) ON DELETE SET NULL
);
```

#### internships 表（实习记录表）

```sql
CREATE TABLE internships (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT UNIQUE NOT NULL,
  student_id INT NOT NULL,
  position_id INT NOT NULL,
  enterprise_id INT NOT NULL,
  teacher_id INT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('ongoing', 'pending_evaluation', 'completed') DEFAULT 'ongoing',
  teacher_score DECIMAL(3,1),
  enterprise_score DECIMAL(3,1),
  final_score DECIMAL(3,1),
  teacher_comment TEXT,
  enterprise_comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
  FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);
```

#### internship_logs 表（实习日志表）

```sql
CREATE TABLE internship_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  internship_id INT NOT NULL,
  content TEXT NOT NULL,
  log_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
);
```

#### internship_files 表（实习文件表）

```sql
CREATE TABLE internship_files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  internship_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  file_type VARCHAR(50),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
);
```

#### notifications 表（通知表）

```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 数据模型关系

```
users (1) ─── (1) students
users (1) ─── (1) teachers
users (1) ─── (1) enterprises

enterprises (1) ─── (N) positions
students (1) ─── (N) applications
positions (1) ─── (N) applications
teachers (1) ─── (N) applications (reviewer)

applications (1) ─── (1) internships
students (1) ─── (N) internships
positions (1) ─── (N) internships
enterprises (1) ─── (N) internships
teachers (1) ─── (N) internships (supervisor)

internships (1) ─── (N) internship_logs
internships (1) ─── (N) internship_files

users (1) ─── (N) notifications
```

### 数据验证规则

**用户数据:**
- username: 3-50 字符，字母数字下划线
- password: 最少 6 字符
- email: 有效的邮箱格式
- phone: 有效的手机号格式（可选）

**岗位数据:**
- title: 非空，最多 200 字符
- description: 非空
- total_slots: 正整数
- start_date < end_date

**申请数据:**
- personal_statement: 非空
- contact_info: 非空

**评分数据:**
- score: 0-100 之间的数字
- final_score = (teacher_score * 0.5 + enterprise_score * 0.5)

**文件上传:**
- 允许的文件类型: pdf, doc, docx, jpg, png
- 最大文件大小: 10MB


## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1: 有效凭据认证成功

*对于任何*有效的用户凭据（用户名和密码），当提交登录请求时，系统应该验证凭据并授予访问权限，返回有效的认证令牌。

**验证: 需求 1.1**

### 属性 2: 无效凭据认证失败

*对于任何*无效的用户凭据（错误的密码、不存在的用户名或格式错误的输入），当提交登录请求时，系统应该拒绝访问并返回错误消息。

**验证: 需求 1.2**

### 属性 3: 基于角色的访问控制

*对于任何*用户和任何 API 端点，系统应该只允许用户访问其角色权限范围内的功能（学生、教师或企业特定的端点）。

**验证: 需求 1.3**

### 属性 4: 会话超时强制重新认证

*对于任何*已超时的用户会话，当尝试访问受保护的资源时，系统应该拒绝访问并要求重新登录。

**验证: 需求 1.4**

### 属性 5: 密码加密存储

*对于任何*用户密码，当存储到数据库时，系统应该使用加密算法（bcrypt）存储密码哈希值，而不是明文密码。

**验证: 需求 1.5**

### 属性 6: 岗位创建完整性

*对于任何*包含所有必填字段的岗位数据，当企业用户创建岗位时，系统应该保存所有岗位信息（名称、描述、要求、名额、期限）并返回创建成功的岗位对象。

**验证: 需求 2.1**

### 属性 7: 岗位更新一致性

*对于任何*已存在的岗位和有效的更新数据，当企业用户编辑岗位时，系统应该更新岗位信息并保持数据一致性（如关联的申请记录保持有效）。

**验证: 需求 2.2**

### 属性 8: 有申请的岗位不可删除

*对于任何*有待处理申请的岗位，当企业用户尝试删除时，系统应该阻止删除操作并返回错误消息。

**验证: 需求 2.3**

### 属性 9: 岗位数据验证

*对于任何*缺少必填字段或字段值无效的岗位数据，当提交创建或更新请求时，系统应该拒绝操作并返回验证错误详情。

**验证: 需求 2.4**

### 属性 10: 岗位名额自动状态更新

*对于任何*岗位，当可用名额降至 0 时，系统应该自动将岗位状态更新为 'full'（已满）。

**验证: 需求 2.5**

### 属性 11: 搜索结果匹配关键词

*对于任何*搜索关键词和岗位数据集，系统返回的所有岗位应该在标题或描述中包含该关键词（不区分大小写）。

**验证: 需求 3.2**

### 属性 12: 筛选结果符合条件

*对于任何*筛选条件（企业、期限、岗位类型）和岗位数据集，系统返回的所有岗位应该满足所有指定的筛选条件。

**验证: 需求 3.3**

### 属性 13: 岗位列表时间倒序排列

*对于任何*岗位列表查询，返回的岗位应该按创建时间倒序排列（最新的在前）。

**验证: 需求 3.4**

### 属性 14: 已满或过期岗位状态标记

*对于任何*已满（available_slots = 0）或已过期（end_date < 当前日期）的岗位，在列表中应该被标记为相应的状态。

**验证: 需求 3.5**

### 属性 15: 申请创建关联正确

*对于任何*有效的学生和岗位，当学生提交申请时，系统应该创建申请记录并正确关联学生 ID 和岗位 ID。

**验证: 需求 4.1**

### 属性 16: 重复申请限制

*对于任何*已有待审批或已通过申请的学生，当尝试提交新申请时，系统应该阻止提交并返回错误消息。

**验证: 需求 4.2**

### 属性 17: 已满岗位不可申请

*对于任何*名额已满（available_slots = 0）的岗位，当学生尝试申请时，系统应该阻止申请并返回错误消息。

**验证: 需求 4.3**

### 属性 18: 申请数据完整性验证

*对于任何*缺少必填字段（个人简介、联系方式）的申请数据，当提交申请时，系统应该拒绝操作并返回验证错误。

**验证: 需求 4.4**

### 属性 19: 申请提交触发通知

*对于任何*成功提交的申请，系统应该向相关教师发送待审批通知。

**验证: 需求 4.5, 9.2**

### 属性 20: 批准申请状态更新和通知

*对于任何*待审批的申请，当教师批准时，系统应该更新申请状态为 'approved'，并向学生和企业发送通知。

**验证: 需求 5.2**

### 属性 21: 拒绝申请需要原因

*对于任何*待审批的申请，当教师拒绝时，系统应该要求提供拒绝原因，并更新申请状态为 'rejected'。

**验证: 需求 5.3**

### 属性 22: 批准申请创建实习记录

*对于任何*被批准的申请，系统应该自动创建对应的实习记录，并将岗位的可用名额减 1。

**验证: 需求 5.4**

### 属性 23: 审批记录完整性

*对于任何*审批操作（批准或拒绝），系统应该记录审批时间和审批人信息。

**验证: 需求 5.5**

### 属性 24: 实习日志保存完整

*对于任何*有效的实习日志内容，当学生提交时，系统应该保存日志内容、日志日期和提交时间。

**验证: 需求 6.1**

### 属性 25: 文件上传验证

*对于任何*上传的文件，系统应该验证文件格式（pdf, doc, docx, jpg, png）和大小（≤10MB），只有通过验证的文件才被存储。

**验证: 需求 6.2**

### 属性 26: 实习进度计算正确

*对于任何*实习记录，系统显示的进度应该等于（当前日期 - 开始日期）/（结束日期 - 开始日期），且不超过 100%。

**验证: 需求 6.3**

### 属性 27: 实习到期自动状态转换

*对于任何*实习记录，当当前日期 ≥ 结束日期时，系统应该自动将实习状态更新为 'pending_evaluation'（待评价）。

**验证: 需求 6.4**

### 属性 28: 教师访问学生实习资料

*对于任何*实习记录，相关教师应该能够查看该实习的所有日志和文件。

**验证: 需求 6.5**

### 属性 29: 评价保存完整性

*对于任何*有效的评价数据（评分和评语），当教师或企业提交评价时，系统应该保存评价内容、评分和提交时间。

**验证: 需求 7.1, 7.2**

### 属性 30: 综合评分计算正确

*对于任何*同时具有教师评分和企业评分的实习记录，系统计算的综合评分应该等于（教师评分 × 0.5 + 企业评分 × 0.5）。

**验证: 需求 7.3**

### 属性 31: 双方评价完成后状态更新

*对于任何*实习记录，当教师评价和企业评价都已提交时，系统应该将实习状态更新为 'completed'（已完成）。

**验证: 需求 7.4**

### 属性 32: 学生查看自己的评价

*对于任何*实习记录，学生应该能够查看自己的实习评价和评分。

**验证: 需求 7.5**

### 属性 33: 统计数据按时间段聚合

*对于任何*时间段筛选条件（月度、学期），系统返回的统计数据应该只包含该时间段内的实习记录。

**验证: 需求 8.2**

### 属性 34: 企业统计数据准确性

*对于任何*企业，系统显示的岗位数量应该等于该企业创建的岗位总数，学生分布应该等于在该企业实习的学生数量。

**验证: 需求 8.3**

### 属性 35: 报表导出格式正确

*对于任何*统计报表导出请求，系统应该生成指定格式（PDF 或 Excel）的文件，且包含所有统计数据。

**验证: 需求 8.4**

### 属性 36: 筛选条件变更更新统计

*对于任何*统计查询，当筛选条件改变时，系统返回的统计数据应该反映新的筛选条件。

**验证: 需求 8.5**

### 属性 37: 状态变更触发通知

*对于任何*申请或实习状态变更，系统应该向相关用户（学生、教师、企业）发送通知。

**验证: 需求 9.1**

### 属性 38: 实习到期提醒

*对于任何*即将到期的实习（距离结束日期 ≤ 7 天），系统应该向学生和教师发送提醒通知。

**验证: 需求 9.3**

### 属性 39: 未读通知数量显示

*对于任何*用户登录后，系统显示的未读通知数量应该等于该用户 is_read = false 的通知记录数。

**验证: 需求 9.4**

### 属性 40: 查看通知标记已读

*对于任何*通知，当用户查看时，系统应该将该通知的 is_read 字段更新为 true。

**验证: 需求 9.5**

### 属性 41: 数据操作立即持久化

*对于任何*数据创建或修改操作，系统应该在操作成功返回前将数据持久化到数据库。

**验证: 需求 10.1**

### 属性 42: 数据库操作失败回滚

*对于任何*数据库操作失败的情况，系统应该回滚事务，确保数据库保持一致状态（不会出现部分更新）。

**验证: 需求 10.3**

### 属性 43: 关键操作日志记录

*对于任何*关键操作（用户登录、申请审批、评价提交等），系统应该记录操作日志，包含操作类型、操作人、操作时间。

**验证: 需求 10.4**

### 属性 44: 数据完整性约束验证

*对于任何*违反数据完整性约束的操作（外键约束、非空约束、唯一约束），系统应该拒绝操作并返回错误消息。

**验证: 需求 10.5**


## 错误处理

### 错误类型和处理策略

#### 1. 验证错误（Validation Errors）

**场景:**
- 用户输入不完整或格式错误
- 数据不符合业务规则

**处理策略:**
- HTTP 状态码: 400 Bad Request
- 返回详细的验证错误信息
- 前端显示友好的错误提示

**示例:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "验证失败",
    "details": [
      { "field": "title", "message": "岗位标题不能为空" },
      { "field": "total_slots", "message": "名额必须是正整数" }
    ]
  }
}
```

#### 2. 认证错误（Authentication Errors）

**场景:**
- 用户未登录或令牌无效
- 会话已过期

**处理策略:**
- HTTP 状态码: 401 Unauthorized
- 清除客户端存储的令牌
- 重定向到登录页面

**示例:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "认证失败，请重新登录"
  }
}
```

#### 3. 授权错误（Authorization Errors）

**场景:**
- 用户尝试访问无权限的资源
- 角色权限不足

**处理策略:**
- HTTP 状态码: 403 Forbidden
- 返回权限不足的错误信息
- 前端隐藏或禁用无权限的操作

**示例:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "您没有权限执行此操作"
  }
}
```

#### 4. 资源不存在错误（Not Found Errors）

**场景:**
- 请求的资源不存在
- ID 无效或已被删除

**处理策略:**
- HTTP 状态码: 404 Not Found
- 返回资源不存在的错误信息
- 前端显示友好的提示或重定向

**示例:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "请求的岗位不存在"
  }
}
```

#### 5. 业务逻辑错误（Business Logic Errors）

**场景:**
- 操作违反业务规则（如重复申请、岗位已满）
- 状态不允许的操作

**处理策略:**
- HTTP 状态码: 409 Conflict 或 422 Unprocessable Entity
- 返回具体的业务错误信息
- 前端显示清晰的错误原因

**示例:**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_APPLICATION",
    "message": "您已经申请过该岗位，不能重复申请"
  }
}
```

#### 6. 服务器错误（Server Errors）

**场景:**
- 数据库连接失败
- 未预期的系统错误

**处理策略:**
- HTTP 状态码: 500 Internal Server Error
- 记录详细的错误日志
- 返回通用的错误信息（不暴露内部细节）
- 触发告警通知开发团队

**示例:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "服务器内部错误，请稍后重试"
  }
}
```

### 错误处理中间件

后端使用统一的错误处理中间件：

```javascript
// 错误处理中间件
app.use((err, req, res, next) => {
  // 记录错误日志
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id
  });

  // 根据错误类型返回相应的响应
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message,
      details: err.details || []
    },
    timestamp: Date.now()
  });
});
```

### 前端错误处理

前端使用 Axios 拦截器统一处理错误：

```javascript
// 响应拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          // 清除令牌并重定向到登录页
          store.dispatch('auth/logout');
          router.push('/login');
          break;
        case 403:
          ElMessage.error('您没有权限执行此操作');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        default:
          ElMessage.error(response.data.error.message || '操作失败');
      }
    } else {
      ElMessage.error('网络错误，请检查您的网络连接');
    }
    
    return Promise.reject(error);
  }
);
```

## 测试策略

### 双重测试方法

系统采用单元测试和基于属性的测试相结合的方法，以确保全面的测试覆盖：

- **单元测试**: 验证特定示例、边缘情况和错误条件
- **基于属性的测试**: 验证跨所有输入的通用属性
- 两者是互补的，对于全面覆盖都是必需的

### 单元测试

单元测试专注于：
- 特定示例，展示正确行为
- 组件之间的集成点
- 边缘情况和错误条件

**不要编写过多的单元测试** - 基于属性的测试处理大量输入的覆盖。

#### 前端单元测试

**测试框架**: Jest + Vue Test Utils

**测试范围:**
- 组件渲染和交互
- Vuex 状态管理
- 路由导航
- API 调用模拟

**示例测试:**
```javascript
describe('PositionList.vue', () => {
  it('应该显示岗位列表', () => {
    const positions = [
      { id: 1, title: '前端开发实习', company: 'ABC公司' },
      { id: 2, title: '后端开发实习', company: 'XYZ公司' }
    ];
    const wrapper = mount(PositionList, {
      props: { positions }
    });
    expect(wrapper.findAll('.position-item')).toHaveLength(2);
  });

  it('应该处理空列表情况', () => {
    const wrapper = mount(PositionList, {
      props: { positions: [] }
    });
    expect(wrapper.text()).toContain('暂无岗位');
  });
});
```

#### 后端单元测试

**测试框架**: Jest + Supertest

**测试范围:**
- API 端点
- 业务逻辑服务
- 数据模型验证
- 中间件功能

**示例测试:**
```javascript
describe('POST /api/applications', () => {
  it('应该成功创建申请', async () => {
    const applicationData = {
      position_id: 1,
      personal_statement: '我对这个岗位很感兴趣',
      contact_info: '13800138000'
    };
    
    const response = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(applicationData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('pending');
  });

  it('应该拒绝缺少必填字段的申请', async () => {
    const invalidData = {
      position_id: 1
      // 缺少 personal_statement 和 contact_info
    };
    
    const response = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(invalidData)
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

### 基于属性的测试

**测试框架**: fast-check (JavaScript/TypeScript)

**配置要求:**
- 每个属性测试最少运行 100 次迭代（由于随机化）
- 每个测试必须引用其设计文档属性
- 标签格式: **Feature: university-internship-management, Property {number}: {property_text}**

#### 属性测试示例

**属性 5: 密码加密存储**

```javascript
const fc = require('fast-check');

describe('Feature: university-internship-management, Property 5: 密码加密存储', () => {
  it('对于任何密码，存储的应该是加密后的哈希值', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 6, maxLength: 50 }), // 生成随机密码
        async (password) => {
          const user = await User.create({
            username: `user_${Date.now()}`,
            password: password,
            role: 'student',
            email: `test_${Date.now()}@example.com`,
            real_name: 'Test User'
          });
          
          // 验证数据库中存储的不是明文密码
          const storedUser = await User.findByPk(user.id);
          expect(storedUser.password_hash).not.toBe(password);
          
          // 验证可以使用原始密码验证
          const isValid = await bcrypt.compare(password, storedUser.password_hash);
          expect(isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**属性 11: 搜索结果匹配关键词**

```javascript
describe('Feature: university-internship-management, Property 11: 搜索结果匹配关键词', () => {
  it('对于任何搜索关键词，返回的所有岗位都应包含该关键词', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }), // 生成随机搜索词
        fc.array(fc.record({
          title: fc.string({ minLength: 5, maxLength: 50 }),
          description: fc.string({ minLength: 10, maxLength: 200 })
        })), // 生成随机岗位数据
        async (keyword, positions) => {
          // 创建测试数据
          await Position.bulkCreate(positions.map(p => ({
            ...p,
            enterprise_id: 1,
            total_slots: 5,
            available_slots: 5,
            start_date: new Date(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          })));
          
          // 执行搜索
          const results = await positionService.search(keyword);
          
          // 验证所有结果都包含关键词
          results.forEach(position => {
            const containsKeyword = 
              position.title.toLowerCase().includes(keyword.toLowerCase()) ||
              position.description.toLowerCase().includes(keyword.toLowerCase());
            expect(containsKeyword).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**属性 30: 综合评分计算正确**

```javascript
describe('Feature: university-internship-management, Property 30: 综合评分计算正确', () => {
  it('对于任何教师评分和企业评分，综合评分应该是加权平均', () => {
    fc.assert(
      fc.asyncProperty(
        fc.float({ min: 0, max: 100 }), // 生成随机教师评分
        fc.float({ min: 0, max: 100 }), // 生成随机企业评分
        async (teacherScore, enterpriseScore) => {
          const internship = await Internship.create({
            application_id: 1,
            student_id: 1,
            position_id: 1,
            enterprise_id: 1,
            start_date: new Date(),
            end_date: new Date(),
            status: 'pending_evaluation'
          });
          
          // 提交评分
          await internship.update({
            teacher_score: teacherScore,
            enterprise_score: enterpriseScore
          });
          
          // 计算综合评分
          await internshipService.calculateFinalScore(internship.id);
          
          // 验证计算结果
          await internship.reload();
          const expectedScore = (teacherScore * 0.5 + enterpriseScore * 0.5);
          expect(Math.abs(internship.final_score - expectedScore)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 集成测试

**测试范围:**
- 端到端的业务流程
- 多个组件的协作
- 数据库事务完整性

**示例场景:**
1. 完整的实习申请流程：学生申请 → 教师审批 → 创建实习记录
2. 实习评价流程：教师评价 → 企业评价 → 计算综合评分 → 状态更新
3. 通知系统：操作触发 → 通知创建 → 用户接收 → 标记已读

### 测试数据管理

**策略:**
- 使用独立的测试数据库
- 每个测试前重置数据库状态
- 使用工厂函数生成测试数据
- 测试后清理数据

**示例工厂函数:**
```javascript
const createTestUser = (role = 'student', overrides = {}) => {
  return User.create({
    username: `test_${role}_${Date.now()}`,
    password: 'password123',
    role: role,
    email: `${role}_${Date.now()}@test.com`,
    real_name: `Test ${role}`,
    ...overrides
  });
};

const createTestPosition = (enterpriseId, overrides = {}) => {
  return Position.create({
    enterprise_id: enterpriseId,
    title: '测试岗位',
    description: '这是一个测试岗位',
    total_slots: 5,
    available_slots: 5,
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ...overrides
  });
};
```

### 持续集成

**CI/CD 流程:**
1. 代码提交触发 CI 流程
2. 运行代码检查（ESLint）
3. 运行所有单元测试
4. 运行所有基于属性的测试
5. 运行集成测试
6. 生成测试覆盖率报告
7. 测试通过后部署到测试环境

**测试覆盖率目标:**
- 代码覆盖率: ≥ 80%
- 关键业务逻辑: 100%
- API 端点: 100%


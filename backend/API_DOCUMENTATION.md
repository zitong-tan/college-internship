# API 文档

## 概述

高校实习管理系统 RESTful API 文档。本文档详细说明了所有可用的 API 端点、请求参数、响应格式和错误代码。

**基础 URL**: `http://localhost:3000/api`

**API 版本**: v1.0.0

**认证方式**: JWT (JSON Web Token)

---

## 目录

1. [认证接口](#认证接口)
2. [实习岗位接口](#实习岗位接口)
3. [实习申请接口](#实习申请接口)
4. [实习记录接口](#实习记录接口)
5. [通知接口](#通知接口)
6. [统计接口](#统计接口)
7. [通用响应格式](#通用响应格式)
8. [错误代码](#错误代码)
9. [认证说明](#认证说明)

---

## 认证接口

### 1.1 用户注册

**端点**: `POST /api/auth/register`

**访问权限**: 公开

**描述**: 注册新用户账户

**请求体**:
```json
{
  "username": "string (3-50字符，必填)",
  "password": "string (最少6字符，必填)",
  "email": "string (有效邮箱格式，必填)",
  "real_name": "string (真实姓名，必填)",
  "phone": "string (手机号，可选)",
  "role": "string (student|teacher|enterprise，必填)",
  
  // 如果 role = "student"，需要以下字段:
  "student_number": "string (学号，必填)",
  "major": "string (专业，可选)",
  "grade": "number (年级，可选)",
  "class_name": "string (班级，可选)",
  
  // 如果 role = "teacher"，需要以下字段:
  "teacher_number": "string (工号，必填)",
  "department": "string (院系，可选)",
  "title": "string (职称，可选)",
  
  // 如果 role = "enterprise"，需要以下字段:
  "company_name": "string (公司名称，必填)",
  "industry": "string (行业，可选)",
  "address": "string (地址，可选)",
  "website": "string (网站，可选)"
}
```

**成功响应** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "student1",
      "email": "student1@example.com",
      "role": "student",
      "real_name": "张三"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "注册成功",
  "timestamp": 1640000000000
}
```


**错误响应** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "验证失败",
    "details": [
      { "field": "username", "message": "用户名已存在" },
      { "field": "email", "message": "邮箱格式不正确" }
    ]
  },
  "timestamp": 1640000000000
}
```

---

### 1.2 用户登录

**端点**: `POST /api/auth/login`

**访问权限**: 公开

**描述**: 用户登录并获取 JWT 令牌

**请求体**:
```json
{
  "username": "string (必填)",
  "password": "string (必填)"
}
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "student1",
      "email": "student1@example.com",
      "role": "student",
      "real_name": "张三"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  },
  "message": "登录成功",
  "timestamp": 1640000000000
}
```

**错误响应** (401 Unauthorized):
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "用户名或密码错误"
  },
  "timestamp": 1640000000000
}
```


---

### 1.3 用户登出

**端点**: `POST /api/auth/logout`

**访问权限**: 需要认证

**描述**: 用户登出（客户端需删除令牌）

**请求头**:
```
Authorization: Bearer <token>
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "message": "登出成功",
  "timestamp": 1640000000000
}
```

---

### 1.4 获取用户信息

**端点**: `GET /api/auth/profile`

**访问权限**: 需要认证

**描述**: 获取当前登录用户的详细信息

**请求头**:
```
Authorization: Bearer <token>
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "student1",
    "email": "student1@example.com",
    "role": "student",
    "real_name": "张三",
    "phone": "13800138000",
    "student": {
      "id": 1,
      "student_number": "2021001",
      "major": "计算机科学",
      "grade": 2021,
      "class_name": "计科1班"
    }
  },
  "message": "获取成功",
  "timestamp": 1640000000000
}
```


---

### 1.5 修改密码

**端点**: `PUT /api/auth/password`

**访问权限**: 需要认证

**描述**: 修改当前用户密码

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "oldPassword": "string (当前密码，必填)",
  "newPassword": "string (新密码，最少6字符，必填)"
}
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "message": "密码修改成功",
  "timestamp": 1640000000000
}
```

**错误响应** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "当前密码不正确"
  },
  "timestamp": 1640000000000
}
```

---

## 实习岗位接口

### 2.1 获取岗位列表

**端点**: `GET /api/positions`

**访问权限**: 公开

**描述**: 获取实习岗位列表，支持搜索和筛选

**查询参数**:
- `keyword` (string, 可选): 搜索关键词（匹配标题和描述）
- `enterprise_id` (number, 可选): 企业 ID 筛选
- `status` (string, 可选): 岗位状态 (open|full|closed)
- `page` (number, 可选, 默认: 1): 页码
- `limit` (number, 可选, 默认: 10): 每页数量

**示例请求**:
```
GET /api/positions?keyword=前端&status=open&page=1&limit=10
```


**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "positions": [
      {
        "id": 1,
        "title": "前端开发实习生",
        "description": "负责前端页面开发",
        "requirements": "熟悉 Vue.js 框架",
        "total_slots": 5,
        "available_slots": 3,
        "start_date": "2024-03-01",
        "end_date": "2024-06-01",
        "status": "open",
        "enterprise": {
          "id": 1,
          "company_name": "科技有限公司",
          "industry": "互联网"
        },
        "created_at": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  },
  "message": "获取成功",
  "timestamp": 1640000000000
}
```

---

### 2.2 获取岗位详情

**端点**: `GET /api/positions/:id`

**访问权限**: 公开

**描述**: 获取指定岗位的详细信息

**路径参数**:
- `id` (number, 必填): 岗位 ID

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "前端开发实习生",
    "description": "负责前端页面开发，参与项目需求分析和技术方案设计",
    "requirements": "1. 熟悉 Vue.js 框架\n2. 了解 HTML/CSS/JavaScript\n3. 有团队协作精神",
    "total_slots": 5,
    "available_slots": 3,
    "start_date": "2024-03-01",
    "end_date": "2024-06-01",
    "status": "open",
    "enterprise": {
      "id": 1,
      "company_name": "科技有限公司",
      "industry": "互联网",
      "address": "北京市朝阳区",
      "website": "https://example.com"
    },
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  },
  "message": "获取成功",
  "timestamp": 1640000000000
}
```


**错误响应** (404 Not Found):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "岗位不存在"
  },
  "timestamp": 1640000000000
}
```

---

### 2.3 创建岗位

**端点**: `POST /api/positions`

**访问权限**: 企业用户

**描述**: 创建新的实习岗位

**请求头**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:
```json
{
  "title": "string (岗位标题，必填，最多200字符)",
  "description": "string (岗位描述，必填)",
  "requirements": "string (岗位要求，可选)",
  "total_slots": "number (总名额，必填，正整数)",
  "start_date": "string (开始日期，必填，格式: YYYY-MM-DD)",
  "end_date": "string (结束日期，必填，格式: YYYY-MM-DD)"
}
```

**成功响应** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "前端开发实习生",
    "description": "负责前端页面开发",
    "requirements": "熟悉 Vue.js 框架",
    "total_slots": 5,
    "available_slots": 5,
    "start_date": "2024-03-01",
    "end_date": "2024-06-01",
    "status": "open",
    "enterprise_id": 1,
    "created_at": "2024-01-15T10:00:00.000Z"
  },
  "message": "岗位创建成功",
  "timestamp": 1640000000000
}
```


---

### 2.4 更新岗位

**端点**: `PUT /api/positions/:id`

**访问权限**: 企业用户（仅限自己的岗位）

**请求体**: 与创建岗位相同（所有字段可选）

**成功响应** (200 OK): 返回更新后的岗位信息

---

### 2.5 删除岗位

**端点**: `DELETE /api/positions/:id`

**访问权限**: 企业用户（仅限自己的岗位）

**成功响应** (200 OK):
```json
{
  "success": true,
  "message": "岗位删除成功",
  "timestamp": 1640000000000
}
```

**错误响应** (409 Conflict):
```json
{
  "success": false,
  "error": {
    "code": "CONSTRAINT_ERROR",
    "message": "该岗位有待处理的申请，无法删除"
  },
  "timestamp": 1640000000000
}
```

---

## 实习申请接口

### 3.1 提交申请

**端点**: `POST /api/applications`

**访问权限**: 学生用户

**请求体**:
```json
{
  "position_id": "number (岗位ID，必填)",
  "personal_statement": "string (个人简介，必填)",
  "contact_info": "string (联系方式，必填)"
}
```

**成功响应** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "student_id": 1,
    "position_id": 1,
    "status": "pending",
    "personal_statement": "我对这个岗位很感兴趣...",
    "contact_info": "13800138000",
    "applied_at": "2024-01-20T10:00:00.000Z"
  },
  "message": "申请提交成功",
  "timestamp": 1640000000000
}
```


**错误响应** (409 Conflict):
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_APPLICATION",
    "message": "您已经申请过该岗位"
  },
  "timestamp": 1640000000000
}
```

---

### 3.2 获取申请列表

**端点**: `GET /api/applications`

**访问权限**: 需要认证（根据角色返回不同数据）

**查询参数**:
- `status` (string, 可选): 申请状态 (pending|approved|rejected)
- `position_id` (number, 可选): 岗位 ID
- `page` (number, 可选): 页码
- `limit` (number, 可选): 每页数量

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": 1,
        "status": "pending",
        "personal_statement": "我对这个岗位很感兴趣...",
        "contact_info": "13800138000",
        "applied_at": "2024-01-20T10:00:00.000Z",
        "student": {
          "id": 1,
          "real_name": "张三",
          "student_number": "2021001",
          "major": "计算机科学"
        },
        "position": {
          "id": 1,
          "title": "前端开发实习生",
          "enterprise": {
            "company_name": "科技有限公司"
          }
        }
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  },
  "message": "获取成功",
  "timestamp": 1640000000000
}
```


---

### 3.3 获取申请详情

**端点**: `GET /api/applications/:id`

**访问权限**: 需要认证

**成功响应** (200 OK): 返回申请详细信息

---

### 3.4 批准申请

**端点**: `PUT /api/applications/:id/approve`

**访问权限**: 教师用户

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "application": {
      "id": 1,
      "status": "approved",
      "reviewed_at": "2024-01-21T10:00:00.000Z",
      "reviewed_by": 1
    },
    "internship": {
      "id": 1,
      "student_id": 1,
      "position_id": 1,
      "status": "ongoing"
    }
  },
  "message": "申请已批准，实习记录已创建",
  "timestamp": 1640000000000
}
```

---

### 3.5 拒绝申请

**端点**: `PUT /api/applications/:id/reject`

**访问权限**: 教师用户

**请求体**:
```json
{
  "rejection_reason": "string (拒绝原因，必填)"
}
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "rejected",
    "rejection_reason": "岗位要求不匹配",
    "reviewed_at": "2024-01-21T10:00:00.000Z",
    "reviewed_by": 1
  },
  "message": "申请已拒绝",
  "timestamp": 1640000000000
}
```

---

## 实习记录接口

### 4.1 获取实习记录列表

**端点**: `GET /api/internships`

**访问权限**: 需要认证

**查询参数**:
- `status` (string, 可选): 实习状态 (ongoing|pending_evaluation|completed)
- `student_id` (number, 可选): 学生 ID
- `page`, `limit`: 分页参数


**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "internships": [
      {
        "id": 1,
        "status": "ongoing",
        "start_date": "2024-03-01",
        "end_date": "2024-06-01",
        "student": {
          "id": 1,
          "real_name": "张三",
          "student_number": "2021001"
        },
        "position": {
          "id": 1,
          "title": "前端开发实习生"
        },
        "enterprise": {
          "id": 1,
          "company_name": "科技有限公司"
        }
      }
    ]
  },
  "message": "获取成功",
  "timestamp": 1640000000000
}
```

---

### 4.2 获取实习详情

**端点**: `GET /api/internships/:id`

**访问权限**: 需要认证

**成功响应** (200 OK): 返回实习详细信息，包括评价、评分等

---

### 4.3 获取实习进度

**端点**: `GET /api/internships/:id/progress`

**访问权限**: 需要认证

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "internship_id": 1,
    "start_date": "2024-03-01",
    "end_date": "2024-06-01",
    "current_date": "2024-04-01",
    "total_days": 92,
    "completed_days": 31,
    "progress_percentage": 33.7,
    "status": "ongoing"
  },
  "message": "获取成功",
  "timestamp": 1640000000000
}
```


---

### 4.4 提交实习日志

**端点**: `POST /api/internships/:id/logs`

**访问权限**: 学生用户

**请求体**:
```json
{
  "content": "string (日志内容，必填)",
  "log_date": "string (日志日期，必填，格式: YYYY-MM-DD)"
}
```

**成功响应** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "internship_id": 1,
    "content": "今天学习了 Vue 3 的 Composition API...",
    "log_date": "2024-03-15",
    "created_at": "2024-03-15T18:00:00.000Z"
  },
  "message": "日志提交成功",
  "timestamp": 1640000000000
}
```

---

### 4.5 获取实习日志

**端点**: `GET /api/internships/:id/logs`

**访问权限**: 需要认证

**成功响应** (200 OK): 返回日志列表

---

### 4.6 上传实习文件

**端点**: `POST /api/internships/:id/files`

**访问权限**: 学生用户

**请求头**:
```
Content-Type: multipart/form-data
```

**请求体** (FormData):
- `file`: 文件（必填，最大 10MB，支持格式: pdf, doc, docx, jpg, png）

**成功响应** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "internship_id": 1,
    "file_name": "实习报告.pdf",
    "file_path": "/uploads/internships/1/report.pdf",
    "file_size": 1024000,
    "file_type": "application/pdf",
    "uploaded_at": "2024-03-20T10:00:00.000Z"
  },
  "message": "文件上传成功",
  "timestamp": 1640000000000
}
```


---

### 4.7 获取实习文件

**端点**: `GET /api/internships/:id/files`

**访问权限**: 需要认证

**成功响应** (200 OK): 返回文件列表

---

### 4.8 提交教师评价

**端点**: `POST /api/internships/:id/evaluate/teacher`

**访问权限**: 教师用户

**请求体**:
```json
{
  "score": "number (评分，必填，0-100)",
  "comment": "string (评语，必填)"
}
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "teacher_score": 85,
    "teacher_comment": "表现优秀，积极主动",
    "status": "pending_evaluation"
  },
  "message": "评价提交成功",
  "timestamp": 1640000000000
}
```

---

### 4.9 提交企业评价

**端点**: `POST /api/internships/:id/evaluate/enterprise`

**访问权限**: 企业用户

**请求体**: 与教师评价相同

**成功响应** (200 OK): 如果双方评价都已提交，状态更新为 completed，并计算综合评分

---

### 4.10 获取评价信息

**端点**: `GET /api/internships/:id/evaluation`

**访问权限**: 需要认证

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "internship_id": 1,
    "teacher_score": 85,
    "teacher_comment": "表现优秀，积极主动",
    "enterprise_score": 90,
    "enterprise_comment": "工作认真负责",
    "final_score": 87.5,
    "status": "completed"
  },
  "message": "获取成功",
  "timestamp": 1640000000000
}
```


---

## 通知接口

### 5.1 获取通知列表

**端点**: `GET /api/notifications`

**访问权限**: 需要认证

**查询参数**:
- `is_read` (boolean, 可选): 是否已读
- `type` (string, 可选): 通知类型
- `limit` (number, 可选): 每页数量
- `offset` (number, 可选): 偏移量

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "title": "申请已批准",
        "content": "您的实习申请已被批准",
        "type": "application_approved",
        "is_read": false,
        "created_at": "2024-01-21T10:00:00.000Z"
      }
    ],
    "total": 5,
    "unread_count": 2
  },
  "message": "获取成功",
  "timestamp": 1640000000000
}
```

---

### 5.2 获取未读通知数量

**端点**: `GET /api/notifications/unread-count`

**访问权限**: 需要认证

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "unread_count": 3
  },
  "message": "获取成功",
  "timestamp": 1640000000000
}
```

---

### 5.3 标记通知为已读

**端点**: `PUT /api/notifications/:id/read`

**访问权限**: 需要认证

**成功响应** (200 OK):
```json
{
  "success": true,
  "message": "标记成功",
  "timestamp": 1640000000000
}
```


---

### 5.4 标记所有通知为已读

**端点**: `PUT /api/notifications/read-all`

**访问权限**: 需要认证

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "updated_count": 5
  },
  "message": "所有通知已标记为已读",
  "timestamp": 1640000000000
}
```

---

### 5.5 删除通知

**端点**: `DELETE /api/notifications/:id`

**访问权限**: 需要认证

**成功响应** (200 OK):
```json
{
  "success": true,
  "message": "通知已删除",
  "timestamp": 1640000000000
}
```

---

## 统计接口

### 6.1 获取统计概览

**端点**: `GET /api/statistics/overview`

**访问权限**: 教师用户

**查询参数**:
- `startDate` (string, 可选): 开始日期 (YYYY-MM-DD)
- `endDate` (string, 可选): 结束日期 (YYYY-MM-DD)
- `period` (string, 可选): 时间段 (month|semester|year)

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "total_applications": 150,
    "approved_applications": 120,
    "rejected_applications": 20,
    "pending_applications": 10,
    "approval_rate": 80.0,
    "total_internships": 120,
    "ongoing_internships": 80,
    "completed_internships": 40,
    "total_positions": 50,
    "total_enterprises": 20,
    "average_score": 85.5
  },
  "message": "获取成功",
  "timestamp": 1640000000000
}
```


---

### 6.2 获取企业统计

**端点**: `GET /api/statistics/enterprise/:enterpriseId`

**访问权限**: 教师用户、企业用户（仅限自己的数据）

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "enterprise_id": 1,
    "company_name": "科技有限公司",
    "total_positions": 10,
    "total_applications": 50,
    "total_internships": 30,
    "ongoing_internships": 20,
    "completed_internships": 10,
    "average_score": 88.5,
    "student_distribution": {
      "计算机科学": 15,
      "软件工程": 10,
      "信息管理": 5
    }
  },
  "message": "获取成功",
  "timestamp": 1640000000000
}
```

---

### 6.3 获取时间序列统计

**端点**: `GET /api/statistics/timeseries`

**访问权限**: 教师用户

**查询参数**:
- `startDate`, `endDate`: 时间范围
- `groupBy` (string): 分组方式 (day|week|month|year)

**成功响应** (200 OK): 返回按时间分组的统计数据

---

### 6.4 导出 Excel 报表

**端点**: `GET /api/statistics/export/excel`

**访问权限**: 教师用户

**查询参数**: 与统计概览相同

**成功响应** (200 OK):
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- Content-Disposition: attachment; filename="statistics_report.xlsx"
- 返回 Excel 文件流

---

### 6.5 导出 PDF 报表

**端点**: `GET /api/statistics/export/pdf`

**访问权限**: 教师用户

**查询参数**: 与统计概览相同

**成功响应** (200 OK):
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="statistics_report.pdf"
- 返回 PDF 文件流


---

## 通用响应格式

### 成功响应

所有成功的 API 响应遵循以下格式：

```json
{
  "success": true,
  "data": { /* 响应数据 */ },
  "message": "操作成功",
  "timestamp": 1640000000000
}
```

**字段说明**:
- `success` (boolean): 请求是否成功，成功时为 true
- `data` (object|array): 响应数据，根据具体接口而定
- `message` (string): 操作结果消息
- `timestamp` (number): 服务器时间戳（毫秒）

### 错误响应

所有错误响应遵循以下格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": [ /* 详细错误信息（可选） */ ]
  },
  "timestamp": 1640000000000
}
```

**字段说明**:
- `success` (boolean): 请求是否成功，失败时为 false
- `error` (object): 错误信息对象
  - `code` (string): 错误代码（见下方错误代码表）
  - `message` (string): 错误描述信息
  - `details` (array, 可选): 详细错误信息，通常用于验证错误
- `timestamp` (number): 服务器时间戳（毫秒）

---

## 错误代码

### 客户端错误 (4xx)

| HTTP 状态码 | 错误代码 | 说明 |
|------------|---------|------|
| 400 | VALIDATION_ERROR | 请求参数验证失败 |
| 400 | INVALID_INPUT | 输入数据格式不正确 |
| 401 | UNAUTHORIZED | 未认证或令牌无效 |
| 401 | TOKEN_EXPIRED | 令牌已过期 |
| 403 | FORBIDDEN | 权限不足，无法访问资源 |
| 404 | NOT_FOUND | 请求的资源不存在 |
| 409 | DUPLICATE_ERROR | 数据重复（如重复申请） |
| 409 | CONSTRAINT_ERROR | 违反数据完整性约束 |
| 422 | BUSINESS_LOGIC_ERROR | 业务逻辑错误 |


### 服务器错误 (5xx)

| HTTP 状态码 | 错误代码 | 说明 |
|------------|---------|------|
| 500 | INTERNAL_ERROR | 服务器内部错误 |
| 500 | DATABASE_ERROR | 数据库操作失败 |
| 503 | SERVICE_UNAVAILABLE | 服务暂时不可用 |

### 常见错误示例

**验证错误**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "验证失败",
    "details": [
      { "field": "email", "message": "邮箱格式不正确" },
      { "field": "password", "message": "密码长度至少6个字符" }
    ]
  },
  "timestamp": 1640000000000
}
```

**认证错误**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "认证失败，请重新登录"
  },
  "timestamp": 1640000000000
}
```

**权限错误**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "您没有权限执行此操作"
  },
  "timestamp": 1640000000000
}
```

**资源不存在**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "请求的资源不存在"
  },
  "timestamp": 1640000000000
}
```

---

## 认证说明

### JWT 令牌认证

系统使用 JWT (JSON Web Token) 进行身份认证。


### 获取令牌

通过登录接口获取 JWT 令牌：

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "student1",
  "password": "password123"
}
```

响应中包含令牌：

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### 使用令牌

在需要认证的请求中，将令牌添加到请求头：

```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 令牌过期

令牌默认有效期为 24 小时。过期后需要重新登录获取新令牌。

### 角色权限

系统支持三种用户角色，不同角色有不同的访问权限：

| 角色 | 权限说明 |
|------|---------|
| student | 学生用户：浏览岗位、提交申请、管理实习过程、查看评价 |
| teacher | 教师用户：审批申请、监督实习、提交评价、查看统计 |
| enterprise | 企业用户：发布岗位、管理岗位、查看实习生、提交评价 |

---

## 分页说明

支持分页的接口使用以下查询参数：

- `page` (number, 默认: 1): 页码，从 1 开始
- `limit` (number, 默认: 10): 每页数量，最大 100

分页响应格式：

```json
{
  "success": true,
  "data": {
    "items": [ /* 数据列表 */ ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

---

## 日期时间格式

- 日期格式: `YYYY-MM-DD` (例如: 2024-01-15)
- 日期时间格式: ISO 8601 (例如: 2024-01-15T10:00:00.000Z)
- 时间戳: Unix 时间戳（毫秒）


---

## 文件上传说明

### 支持的文件类型

- 文档: pdf, doc, docx
- 图片: jpg, jpeg, png

### 文件大小限制

- 最大文件大小: 10MB

### 上传示例

使用 multipart/form-data 格式上传文件：

```javascript
const formData = new FormData();
formData.append('file', fileObject);

fetch('/api/internships/1/files', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

---

## 搜索和筛选

### 岗位搜索

支持关键词搜索和多条件筛选：

```http
GET /api/positions?keyword=前端&status=open&enterprise_id=1&page=1&limit=10
```

**搜索规则**:
- `keyword`: 在岗位标题和描述中搜索（不区分大小写）
- 多个筛选条件使用 AND 逻辑
- 结果按创建时间倒序排列

### 申请筛选

```http
GET /api/applications?status=pending&position_id=1
```

---

## 速率限制

为保护服务器资源，API 实施以下速率限制：

- 登录接口: 每 IP 每分钟最多 5 次请求
- 其他接口: 每用户每分钟最多 100 次请求

超过限制时返回 429 Too Many Requests 错误。

---

## 测试环境

**测试服务器**: `http://localhost:3000/api`

**测试账户**:

学生账户:
- 用户名: `student1`
- 密码: `password123`

教师账户:
- 用户名: `teacher1`
- 密码: `password123`

企业账户:
- 用户名: `enterprise1`
- 密码: `password123`

---

## 常见问题

### Q1: 如何处理令牌过期？

A: 当收到 401 错误且错误代码为 TOKEN_EXPIRED 时，需要重新登录获取新令牌。


### Q2: 如何调试 API 请求？

A: 推荐使用 Postman 或类似工具。确保：
1. 设置正确的 Content-Type 头
2. 对于需要认证的接口，添加 Authorization 头
3. 检查请求体格式是否正确

### Q3: 为什么收到 403 错误？

A: 403 错误表示权限不足。检查：
1. 当前用户角色是否有权限访问该接口
2. 是否尝试访问其他用户的资源（如企业修改其他企业的岗位）

### Q4: 如何处理文件上传失败？

A: 检查：
1. 文件大小是否超过 10MB
2. 文件类型是否在支持列表中
3. 请求头是否正确设置为 multipart/form-data

### Q5: 分页参数如何使用？

A: 使用 page 和 limit 参数：
- 第一页: `?page=1&limit=10`
- 第二页: `?page=2&limit=10`
- 每页 20 条: `?page=1&limit=20`

---

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 实现所有核心功能接口
- 支持用户认证、岗位管理、申请流程、实习管理、通知系统、统计报表

---

## 联系方式

如有问题或建议，请联系开发团队。

**技术支持**: support@example.com

**文档更新**: 2024-01-15

---

## 附录

### A. HTTP 状态码说明

| 状态码 | 说明 |
|-------|------|
| 200 | OK - 请求成功 |
| 201 | Created - 资源创建成功 |
| 400 | Bad Request - 请求参数错误 |
| 401 | Unauthorized - 未认证 |
| 403 | Forbidden - 权限不足 |
| 404 | Not Found - 资源不存在 |
| 409 | Conflict - 资源冲突 |
| 422 | Unprocessable Entity - 业务逻辑错误 |
| 429 | Too Many Requests - 请求过于频繁 |
| 500 | Internal Server Error - 服务器错误 |
| 503 | Service Unavailable - 服务不可用 |


### B. Postman 集合

可以导入以下 Postman 集合快速测试 API：

```json
{
  "info": {
    "name": "高校实习管理系统 API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "认证",
      "item": [
        {
          "name": "登录",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"student1\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    }
  ]
}
```

### C. 示例代码

**JavaScript (Axios)**:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000
});

// 添加请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 登录
async function login(username, password) {
  const response = await api.post('/auth/login', { username, password });
  localStorage.setItem('token', response.data.data.token);
  return response.data;
}

// 获取岗位列表
async function getPositions(params) {
  const response = await api.get('/positions', { params });
  return response.data;
}
```

---

**结束**

本文档涵盖了高校实习管理系统的所有 API 接口。如有疑问，请参考相关章节或联系技术支持。


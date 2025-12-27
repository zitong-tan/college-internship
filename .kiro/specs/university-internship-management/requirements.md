# 需求文档

## 简介

高校实习管理系统是一个用于管理学生实习过程的综合平台。该系统支持学生、教师和企业三方用户，提供实习岗位发布、申请、审批、过程管理和评价等完整的实习管理流程。

## 术语表

- **System**: 高校实习管理系统
- **Student**: 学生用户，可以浏览和申请实习岗位
- **Teacher**: 教师用户，负责审批学生实习申请和监督实习过程
- **Enterprise**: 企业用户，可以发布实习岗位和管理实习生
- **Internship_Position**: 实习岗位，包含岗位信息、要求和名额
- **Application**: 实习申请，学生提交的实习岗位申请
- **Internship_Record**: 实习记录，记录学生的实习过程和状态

## 需求

### 需求 1: 用户认证与授权

**用户故事:** 作为系统用户，我想要安全地登录系统，以便访问相应权限的功能。

#### 验收标准

1. WHEN 用户输入有效的用户名和密码 THEN THE System SHALL 验证凭据并授予访问权限
2. WHEN 用户输入无效的凭据 THEN THE System SHALL 拒绝访问并显示错误消息
3. THE System SHALL 根据用户角色（学生、教师、企业）提供不同的功能访问权限
4. WHEN 用户会话超时 THEN THE System SHALL 要求用户重新登录
5. THE System SHALL 加密存储用户密码

### 需求 2: 实习岗位管理

**用户故事:** 作为企业用户，我想要发布和管理实习岗位，以便招募合适的实习生。

#### 验收标准

1. WHEN 企业用户创建实习岗位 THEN THE System SHALL 保存岗位信息（岗位名称、描述、要求、名额、期限）
2. WHEN 企业用户编辑已发布的岗位 THEN THE System SHALL 更新岗位信息并保持数据一致性
3. WHEN 企业用户删除岗位 THEN THE System SHALL 检查是否有待处理的申请，如有则阻止删除
4. THE System SHALL 验证岗位信息的完整性（所有必填字段不为空）
5. WHEN 岗位名额已满 THEN THE System SHALL 自动将岗位状态标记为已满

### 需求 3: 实习岗位浏览与搜索

**用户故事:** 作为学生用户，我想要浏览和搜索实习岗位，以便找到适合自己的实习机会。

#### 验收标准

1. WHEN 学生访问岗位列表页面 THEN THE System SHALL 显示所有可用的实习岗位
2. WHEN 学生输入搜索关键词 THEN THE System SHALL 返回匹配岗位名称或描述的岗位列表
3. WHEN 学生应用筛选条件（企业、期限、岗位类型） THEN THE System SHALL 返回符合条件的岗位
4. THE System SHALL 按发布时间倒序显示岗位列表
5. WHEN 岗位已满或已过期 THEN THE System SHALL 在列表中标记该岗位状态

### 需求 4: 实习申请提交

**用户故事:** 作为学生用户，我想要申请实习岗位，以便获得实习机会。

#### 验收标准

1. WHEN 学生提交实习申请 THEN THE System SHALL 创建申请记录并关联学生和岗位信息
2. WHEN 学生已有待审批或已通过的申请 THEN THE System SHALL 阻止学生提交新的申请
3. WHEN 岗位名额已满 THEN THE System SHALL 阻止学生提交申请
4. THE System SHALL 验证申请信息的完整性（个人简介、联系方式等必填字段）
5. WHEN 申请提交成功 THEN THE System SHALL 通知相关教师进行审批

### 需求 5: 实习申请审批

**用户故事:** 作为教师用户，我想要审批学生的实习申请，以便确保学生选择合适的实习岗位。

#### 验收标准

1. WHEN 教师查看待审批申请列表 THEN THE System SHALL 显示所有待审批状态的申请
2. WHEN 教师批准申请 THEN THE System SHALL 更新申请状态为已批准并通知学生和企业
3. WHEN 教师拒绝申请 THEN THE System SHALL 更新申请状态为已拒绝并要求填写拒绝原因
4. WHEN 申请被批准 THEN THE System SHALL 创建实习记录并减少岗位可用名额
5. THE System SHALL 记录审批时间和审批人信息

### 需求 6: 实习过程管理

**用户故事:** 作为学生用户，我想要记录实习过程，以便完成实习要求。

#### 验收标准

1. WHEN 学生提交实习日志 THEN THE System SHALL 保存日志内容和提交时间
2. WHEN 学生上传实习相关文件 THEN THE System SHALL 验证文件格式和大小并存储文件
3. THE System SHALL 显示学生的实习进度（已完成天数/总天数）
4. WHEN 实习期满 THEN THE System SHALL 自动更新实习状态为待评价
5. THE System SHALL 允许教师查看学生的实习日志和文件

### 需求 7: 实习评价

**用户故事:** 作为教师和企业用户，我想要评价学生的实习表现，以便记录实习成果。

#### 验收标准

1. WHEN 实习结束后教师提交评价 THEN THE System SHALL 保存评价内容和评分
2. WHEN 实习结束后企业提交评价 THEN THE System SHALL 保存企业评价和评分
3. THE System SHALL 计算综合评分（教师评分和企业评分的加权平均）
4. WHEN 双方评价都已提交 THEN THE System SHALL 更新实习状态为已完成
5. THE System SHALL 允许学生查看自己的实习评价和评分

### 需求 8: 数据统计与报表

**用户故事:** 作为教师用户，我想要查看实习数据统计，以便了解整体实习情况。

#### 验收标准

1. WHEN 教师访问统计页面 THEN THE System SHALL 显示实习申请数量、通过率等统计数据
2. THE System SHALL 按时间段（月度、学期）统计实习数据
3. THE System SHALL 显示各企业的实习岗位数量和学生分布
4. THE System SHALL 生成可导出的统计报表（PDF或Excel格式）
5. WHEN 筛选条件改变 THEN THE System SHALL 实时更新统计数据

### 需求 9: 通知系统

**用户故事:** 作为系统用户，我想要接收相关通知，以便及时了解重要信息。

#### 验收标准

1. WHEN 申请状态变更 THEN THE System SHALL 向相关用户发送通知
2. WHEN 有新的待审批申请 THEN THE System SHALL 通知相关教师
3. WHEN 实习即将到期 THEN THE System SHALL 提前提醒学生和教师
4. THE System SHALL 在用户登录后显示未读通知数量
5. WHEN 用户查看通知 THEN THE System SHALL 标记通知为已读

### 需求 10: 数据持久化

**用户故事:** 作为系统管理员，我想要确保数据安全存储，以便系统稳定运行。

#### 验收标准

1. WHEN 用户创建或修改数据 THEN THE System SHALL 立即持久化到数据库
2. THE System SHALL 定期备份数据库
3. WHEN 数据库操作失败 THEN THE System SHALL 回滚事务并保持数据一致性
4. THE System SHALL 记录所有关键操作的日志
5. THE System SHALL 验证数据完整性约束（外键、非空等）

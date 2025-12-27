# 企业端评价功能修复总结

## 问题描述
企业端点击"实习学生"页面的"评价"按钮时出现运行时错误：
```
Cannot destructure property 'type' of 'vnode' as it is null
```

以及在显示学生列表时出现：
```
row.enterprise_score.toFixed is not a function
```

## 根本原因

### 1. API 端点不匹配
前端 API 调用使用了通用的 `/internships/:id/evaluate` 端点，但后端实际上有两个独立的端点：
- `/internships/:id/evaluate/teacher` - 教师评价
- `/internships/:id/evaluate/enterprise` - 企业评价

### 2. 响应数据解析错误
`EnterpriseEvaluation.vue` 组件中使用了 `response.data.success`，但根据 axios 响应拦截器的处理，应该使用 `response.success`。

### 3. 组件卸载时的状态问题
在评价提交成功后，`handleEvaluationSuccess` 函数先关闭对话框，然后重新获取学生列表。这导致：
1. `students.value` 数组被更新
2. `currentStudent.value` 仍然指向旧的对象引用
3. Vue 在卸载 `EnterpriseEvaluation` 组件时遇到 null 引用

### 4. Prop 验证不足
`EnterpriseEvaluation` 组件的 watch 没有充分验证 `internship` prop 是否有效。

### 5. 数据类型问题
从数据库返回的评分字段（`teacher_score`, `enterprise_score`, `final_score`）可能是字符串类型或 null，直接调用 `.toFixed()` 会导致错误。需要先转换为数字类型并检查是否为 null。

## 修复内容

### 1. 修复 API 定义 (`src/api/internship.js`)

```javascript
// 修复前
export function submitEvaluation(internshipId, data) {
  return request({
    url: `/internships/${internshipId}/evaluate`,
    method: 'post',
    data
  });
}

// 修复后
export function submitTeacherEvaluation(internshipId, data) {
  return request({
    url: `/internships/${internshipId}/evaluate/teacher`,
    method: 'post',
    data
  });
}

export function submitEnterpriseEvaluation(internshipId, data) {
  return request({
    url: `/internships/${internshipId}/evaluate/enterprise`,
    method: 'post',
    data
  });
}
```

### 2. 修复企业评价组件 (`src/components/enterprise/EnterpriseEvaluation.vue`)

#### 2.1 修复 API 导入和调用
```javascript
// 修复前
import { submitEvaluation } from '@/api/internship';
const response = await submitEvaluation(props.internship.id, submitData);
if (response.data.success) { ... }

// 修复后
import { submitEnterpriseEvaluation } from '@/api/internship';
const response = await submitEnterpriseEvaluation(props.internship.id, {
  score: formData.value.score,
  comment: formData.value.comment
});
if (response.success) { ... }
```

#### 2.2 增强 Prop 验证
```javascript
// 修复前
watch(() => props.internship, (newVal) => {
  if (newVal) { ... }
}, { immediate: true });

// 修复后
watch(() => props.internship, (newVal) => {
  if (newVal && newVal.id) { ... }
}, { immediate: true });
```

### 3. 修复学生列表页面 (`src/views/enterprise/StudentList.vue`)

#### 3.1 修复状态清理
```javascript
// 修复前
const handleEvaluationSuccess = () => {
  evaluationVisible.value = false;
  fetchStudents();
};

// 修复后
const handleEvaluationSuccess = () => {
  evaluationVisible.value = false;
  currentStudent.value = null;  // 清空引用，避免卸载时出错
  fetchStudents();
};
```

#### 3.2 修复评分显示（表格）
```javascript
// 修复前
{{ row.enterprise_score ? row.enterprise_score.toFixed(1) : '-' }}

// 修复后
{{ row.enterprise_score != null ? Number(row.enterprise_score).toFixed(1) : '-' }}
```

#### 3.3 修复评分显示（详情对话框）
```javascript
// 修复前
{{ currentStudent.teacher_score ? currentStudent.teacher_score.toFixed(1) : '-' }}
{{ currentStudent.enterprise_score ? currentStudent.enterprise_score.toFixed(1) : '-' }}
{{ currentStudent.final_score ? currentStudent.final_score.toFixed(1) : '-' }}

// 修复后
{{ currentStudent.teacher_score != null ? Number(currentStudent.teacher_score).toFixed(1) : '-' }}
{{ currentStudent.enterprise_score != null ? Number(currentStudent.enterprise_score).toFixed(1) : '-' }}
{{ currentStudent.final_score != null ? Number(currentStudent.final_score).toFixed(1) : '-' }}
```

### 4. 修复教师端评价功能 (`src/views/teacher/StudentMonitor.vue`)

```javascript
// 修复前
import { getInternships, getLogs, getFiles, submitEvaluation } from '@/api/internship';
await submitEvaluation(data.internship_id, {
  teacher_score: data.teacher_score,
  teacher_comment: data.teacher_comment
});

// 修复后
import { getInternships, getLogs, getFiles, submitTeacherEvaluation } from '@/api/internship';
await submitTeacherEvaluation(data.internship_id, {
  score: data.teacher_score,
  comment: data.teacher_comment
});
```

## 数据类型处理说明

在显示评分时，使用以下模式确保类型安全：
```javascript
// ✅ 正确：检查 null 并转换为数字
{{ value != null ? Number(value).toFixed(1) : '-' }}

// ❌ 错误：直接调用 toFixed
{{ value ? value.toFixed(1) : '-' }}  // 如果 value 是字符串会报错

// ❌ 错误：只检查 truthy
{{ value ? value.toFixed(1) : '-' }}  // 如果 value 是 0 会显示 '-'
```

使用 `!= null` 而不是 `!== null` 可以同时检查 `null` 和 `undefined`。

## 后端 API 参数说明

根据后端 `internshipController.js` 的实现，评价 API 期望的参数是：
- `score`: 评分（0-100）
- `comment`: 评价内容（可选）

而不是：
- `teacher_score` / `enterprise_score`
- `teacher_comment` / `enterprise_comment`

后端会根据用户角色自动将 `score` 和 `comment` 保存到对应的字段。

## 修改的文件
1. `src/api/internship.js` - 拆分评价 API 为教师和企业两个独立函数
2. `src/components/enterprise/EnterpriseEvaluation.vue` - 修复 API 调用和 prop 验证
3. `src/views/enterprise/StudentList.vue` - 修复组件卸载时的状态清理和评分显示
4. `src/views/teacher/StudentMonitor.vue` - 更新为使用新的教师评价 API

## 测试建议
1. 使用企业账号登录
2. 访问"实习学生"页面，确认学生列表正常显示（包括评分列）
3. 点击"评价"按钮，确认对话框正常打开
4. 填写评分和评价内容
5. 提交评价，确认成功且无错误
6. 关闭对话框，确认页面正常刷新且评分正确显示
7. 点击"查看详情"，确认详情对话框中的评分正确显示
8. 使用教师账号测试教师评价功能

## 相关文档
- `ENTERPRISE_DISPLAY_FIX.md` - 企业端显示问题修复
- `MODEL_ASSOCIATION_FIX_SUMMARY.md` - 模型关联修复总结

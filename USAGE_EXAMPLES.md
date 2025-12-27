# Error Handling and UX Optimization - Usage Examples

## Table of Contents
1. [Error Handling](#error-handling)
2. [Loading States](#loading-states)
3. [Form Validation](#form-validation)
4. [Notifications](#notifications)

## Error Handling

### Basic Error Handling
```javascript
import { handleApiError, showSuccess, showError } from '@/utils/errorHandler';

// In your component or API call
try {
  const result = await positionApi.create(data);
  showSuccess('岗位创建成功');
  return result;
} catch (error) {
  // Automatically handles different error types and shows appropriate messages
  handleApiError(error);
  throw error;
}
```

### Custom Error Messages
```javascript
import { showError, showErrorNotification } from '@/utils/errorHandler';

// Simple error message
showError('操作失败，请重试');

// Error notification with details
showErrorNotification('操作失败', '请检查网络连接后重试');
```

### Error Logging (Development)
```javascript
import { logError } from '@/utils/errorHandler';

try {
  // Some operation
} catch (error) {
  logError(error, {
    component: 'PositionList',
    action: 'loadPositions',
    userId: user.id
  });
}
```

## Loading States

### Using Loading Composable
```vue
<template>
  <div>
    <el-button @click="loadData" :loading="loading">
      加载数据
    </el-button>
    
    <div v-if="!loading">
      {{ data }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useLoading } from '@/composables/useLoading';

const data = ref(null);
const { loading, withLoading } = useLoading();

const loadData = async () => {
  await withLoading(async () => {
    data.value = await api.getData();
  });
};
</script>
```

### Using Loading Directive
```vue
<template>
  <!-- Simple loading -->
  <div v-loading="loading">
    Content here
  </div>
  
  <!-- Loading with custom text -->
  <div v-loading="{ show: loading, text: '正在加载数据...' }">
    Content here
  </div>
</template>

<script setup>
import { ref } from 'vue';

const loading = ref(true);

// Simulate loading
setTimeout(() => {
  loading.value = false;
}, 2000);
</script>
```

### Using Skeleton Screens
```vue
<template>
  <div>
    <!-- Show skeleton while loading -->
    <SkeletonList v-if="loading" :count="5" />
    
    <!-- Show actual content when loaded -->
    <div v-else>
      <el-card v-for="item in items" :key="item.id">
        {{ item.title }}
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SkeletonList from '@/components/common/SkeletonList.vue';

const loading = ref(true);
const items = ref([]);

onMounted(async () => {
  items.value = await api.getItems();
  loading.value = false;
});
</script>
```

### Fullscreen Loading
```vue
<script setup>
import { useLoading } from '@/composables/useLoading';

const { showFullscreenLoading, hideFullscreenLoading } = useLoading();

const performLongOperation = async () => {
  showFullscreenLoading('正在处理，请稍候...');
  
  try {
    await api.longOperation();
  } finally {
    hideFullscreenLoading();
  }
};
</script>
```

## Form Validation

### Basic Form with Validation
```vue
<template>
  <el-form 
    ref="formRef" 
    :model="formData" 
    :rules="positionRules"
    label-width="100px"
  >
    <el-form-item label="岗位标题" prop="title">
      <el-input v-model="formData.title" />
    </el-form-item>
    
    <el-form-item label="岗位描述" prop="description">
      <el-input 
        v-model="formData.description" 
        type="textarea" 
        :rows="4"
      />
    </el-form-item>
    
    <el-form-item label="招聘名额" prop="total_slots">
      <el-input-number v-model="formData.total_slots" :min="1" />
    </el-form-item>
    
    <el-form-item>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        提交
      </el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { useForm } from '@/composables/useForm';
import { positionRules } from '@/utils/formValidation';
import { positionApi } from '@/api/position';

const initialData = {
  title: '',
  description: '',
  requirements: '',
  total_slots: 1,
  start_date: null,
  end_date: null
};

const { formRef, formData, loading, submit, reset } = useForm(
  initialData,
  positionRules
);

const handleSubmit = async () => {
  const result = await submit(
    async (data) => await positionApi.create(data),
    {
      successMessage: '岗位创建成功',
      resetOnSuccess: true
    }
  );
  
  if (result.success) {
    // Handle success (e.g., navigate to list)
  }
};

const handleReset = () => {
  reset();
};
</script>
```

### Real-time Validation
```vue
<template>
  <el-form ref="formRef" :model="formData" :rules="applicationRules">
    <el-form-item label="个人简介" prop="personal_statement">
      <el-input 
        v-model="formData.personal_statement"
        type="textarea"
        @blur="validateField('personal_statement')"
      />
    </el-form-item>
    
    <el-form-item label="联系方式" prop="contact_info">
      <el-input 
        v-model="formData.contact_info"
        @blur="validateField('contact_info')"
      />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { useFormWithRealTimeValidation } from '@/composables/useForm';
import { applicationRules } from '@/utils/formValidation';

const { formRef, formData, validateField } = useFormWithRealTimeValidation(
  {
    personal_statement: '',
    contact_info: ''
  },
  applicationRules
);
</script>
```

### Custom Validation Rules
```vue
<script setup>
import { ref } from 'vue';
import { validationRules } from '@/utils/formValidation';

const formRules = {
  email: [
    validationRules.required('邮箱不能为空'),
    validationRules.email()
  ],
  age: [
    validationRules.custom(
      (rule, value, callback) => {
        if (value < 18) {
          callback(new Error('年龄必须大于18岁'));
        } else {
          callback();
        }
      },
      '年龄验证失败'
    )
  ]
};
</script>
```

## Notifications

### Using Notification Composable
```vue
<script setup>
import { useNotification } from '@/composables/useNotification';

const { success, error, warning, confirm, operationSuccess } = useNotification();

// Simple messages
const showSuccess = () => {
  success('操作成功');
};

const showError = () => {
  error('操作失败');
};

const showWarning = () => {
  warning('请注意');
};

// Operation-specific messages
const handleDelete = async () => {
  const confirmed = await confirm('确定要删除这个岗位吗？', '删除确认');
  
  if (confirmed) {
    try {
      await api.delete(id);
      operationSuccess('删除');
    } catch (err) {
      error('删除失败');
    }
  }
};
</script>
```

### Confirmation Dialogs
```vue
<script setup>
import { useNotification } from '@/composables/useNotification';

const { confirm, prompt, alert } = useNotification();

// Confirm dialog
const handleDelete = async () => {
  const confirmed = await confirm(
    '此操作将永久删除该岗位，是否继续？',
    '警告',
    { type: 'warning' }
  );
  
  if (confirmed) {
    // Proceed with deletion
  }
};

// Prompt dialog
const handleRename = async () => {
  const newName = await prompt('请输入新名称', '重命名');
  
  if (newName) {
    // Update name
  }
};

// Alert dialog
const showInfo = async () => {
  await alert('这是一条重要信息', '提示');
};
</script>
```

## Complete Example: Position Form

```vue
<template>
  <div class="position-form" v-loading="loading">
    <el-form 
      ref="formRef" 
      :model="formData" 
      :rules="positionRules"
      label-width="120px"
    >
      <el-form-item label="岗位标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入岗位标题" />
      </el-form-item>
      
      <el-form-item label="岗位描述" prop="description">
        <el-input 
          v-model="formData.description" 
          type="textarea" 
          :rows="4"
          placeholder="请输入岗位描述"
        />
      </el-form-item>
      
      <el-form-item label="岗位要求" prop="requirements">
        <el-input 
          v-model="formData.requirements" 
          type="textarea" 
          :rows="3"
          placeholder="请输入岗位要求"
        />
      </el-form-item>
      
      <el-form-item label="招聘名额" prop="total_slots">
        <el-input-number 
          v-model="formData.total_slots" 
          :min="1" 
          :max="100"
        />
      </el-form-item>
      
      <el-form-item label="开始日期" prop="start_date">
        <el-date-picker 
          v-model="formData.start_date" 
          type="date"
          placeholder="选择开始日期"
        />
      </el-form-item>
      
      <el-form-item label="结束日期" prop="end_date">
        <el-date-picker 
          v-model="formData.end_date" 
          type="date"
          placeholder="选择结束日期"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from '@/composables/useForm';
import { useNotification } from '@/composables/useNotification';
import { positionRules } from '@/utils/formValidation';
import { positionApi } from '@/api/position';

const props = defineProps({
  id: String
});

const router = useRouter();
const { confirm, operationSuccess } = useNotification();

const isEdit = computed(() => !!props.id);

const initialData = {
  title: '',
  description: '',
  requirements: '',
  total_slots: 1,
  start_date: null,
  end_date: null
};

const { formRef, formData, loading, submit, reset, setData } = useForm(
  initialData,
  positionRules
);

// Load data if editing
if (isEdit.value) {
  loading.value = true;
  positionApi.getById(props.id).then(res => {
    setData(res.data);
    loading.value = false;
  });
}

const handleSubmit = async () => {
  const apiCall = isEdit.value 
    ? (data) => positionApi.update(props.id, data)
    : (data) => positionApi.create(data);
  
  const result = await submit(apiCall, {
    successMessage: isEdit.value ? '岗位更新成功' : '岗位创建成功',
    resetOnSuccess: !isEdit.value
  });
  
  if (result.success) {
    router.push('/enterprise/positions');
  }
};

const handleReset = () => {
  reset();
};

const handleCancel = async () => {
  const confirmed = await confirm('确定要取消吗？未保存的更改将丢失。');
  if (confirmed) {
    router.back();
  }
};
</script>

<style scoped>
.position-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
```

## Tips and Best Practices

1. **Always use error handling** for API calls
2. **Show loading states** for async operations
3. **Use skeleton screens** for better perceived performance
4. **Validate forms** before submission
5. **Provide clear feedback** to users
6. **Use confirmation dialogs** for destructive actions
7. **Log errors** in development for debugging
8. **Keep error messages** user-friendly and actionable

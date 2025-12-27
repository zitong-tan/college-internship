<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="100px"
    class="application-form"
  >
    <el-form-item label="岗位信息" v-if="position">
      <div class="position-info">
        <div class="info-row">
          <span class="label">岗位名称:</span>
          <span class="value">{{ position.title }}</span>
        </div>
        <div class="info-row">
          <span class="label">企业名称:</span>
          <span class="value">{{ position.enterprise?.company_name || '未知企业' }}</span>
        </div>
        <div class="info-row">
          <span class="label">实习期限:</span>
          <span class="value">{{ formatDate(position.start_date) }} 至 {{ formatDate(position.end_date) }}</span>
        </div>
      </div>
    </el-form-item>

    <el-form-item label="个人简介" prop="personal_statement">
      <el-input
        v-model="formData.personal_statement"
        type="textarea"
        :rows="8"
        placeholder="请介绍您的教育背景、技能特长、实习经历、为什么适合这个岗位等（至少10个字符）"
        maxlength="1000"
        show-word-limit
      />
      <div class="form-tip">
        提示：详细的个人简介有助于提高申请通过率
      </div>
    </el-form-item>
    
    <el-form-item label="联系方式" prop="contact_info">
      <el-input
        v-model="formData.contact_info"
        placeholder="请输入您的手机号或邮箱，方便企业联系您"
        maxlength="100"
      >
        <template #prefix>
          <el-icon><Phone /></el-icon>
        </template>
      </el-input>
      <div class="form-tip">
        示例：13800138000 或 example@email.com
      </div>
    </el-form-item>

    <el-form-item>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        提交申请
      </el-button>
      <el-button @click="handleCancel">
        取消
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { Phone } from '@element-plus/icons-vue';

const props = defineProps({
  position: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel']);

const formRef = ref(null);
const formData = reactive({
  personal_statement: '',
  contact_info: ''
});

const rules = {
  personal_statement: [
    { required: true, message: '请输入个人简介', trigger: 'blur' },
    { min: 10, message: '个人简介至少10个字符', trigger: 'blur' },
    { max: 1000, message: '个人简介最多1000个字符', trigger: 'blur' }
  ],
  contact_info: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        // Validate phone or email
        const phoneRegex = /^1[3-9]\d{9}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (phoneRegex.test(value) || emailRegex.test(value)) {
          callback();
        } else {
          callback(new Error('请输入有效的手机号或邮箱'));
        }
      },
      trigger: 'blur'
    }
  ]
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', {
        position_id: props.position?.id,
        ...formData
      });
    }
  });
};

const handleCancel = () => {
  emit('cancel');
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  formData.personal_statement = '';
  formData.contact_info = '';
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN');
};

// Watch for position changes to reset form
watch(() => props.position, () => {
  resetForm();
});

// Expose methods
defineExpose({
  resetForm
});
</script>

<style scoped>
.application-form {
  padding: 20px 0;
}

.position-info {
  width: 100%;
  padding: 16px;
  background: #F5F7FA;
  border-radius: 4px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  color: #909399;
  min-width: 80px;
}

.info-row .value {
  color: #303133;
  font-weight: 500;
}

.form-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>

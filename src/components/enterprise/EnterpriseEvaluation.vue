<template>
  <el-dialog
    v-model="dialogVisible"
    title="企业评价"
    width="600px"
    @close="handleClose"
  >
    <div v-if="internship" class="evaluation-info">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="学生姓名">
          {{ internship.real_name }}
        </el-descriptions-item>
        <el-descriptions-item label="实习岗位">
          {{ internship.position_title }}
        </el-descriptions-item>
        <el-descriptions-item label="实习期限">
          {{ formatDate(internship.start_date) }} 至 {{ formatDate(internship.end_date) }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      style="margin-top: 20px;"
    >
      <el-form-item label="评分" prop="score">
        <el-rate
          v-model="rateValue"
          :max="5"
          show-score
          text-color="#ff9900"
          score-template="{value} 分"
          @change="handleRateChange"
        />
        <div style="margin-top: 10px;">
          <el-input-number
            v-model="formData.score"
            :min="0"
            :max="100"
            :step="1"
            placeholder="0-100分"
            style="width: 150px;"
          />
          <span style="margin-left: 10px; color: #909399;">
            (0-100分，或使用星级评分)
          </span>
        </div>
      </el-form-item>

      <el-form-item label="评价内容" prop="comment">
        <el-input
          v-model="formData.comment"
          type="textarea"
          :rows="6"
          placeholder="请输入对学生实习表现的评价"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          提交评价
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { submitEnterpriseEvaluation } from '@/api/internship';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  internship: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:visible', 'success']);

const formRef = ref(null);
const submitting = ref(false);
const rateValue = ref(0);

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const formData = ref({
  score: 0,
  comment: ''
});

// Form validation rules
const rules = {
  score: [
    { required: true, message: '请输入评分', trigger: 'blur' },
    { 
      type: 'number', 
      min: 0, 
      max: 100, 
      message: '评分必须在 0 到 100 之间', 
      trigger: 'blur' 
    }
  ],
  comment: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { 
      min: 10, 
      max: 500, 
      message: '评价内容长度在 10 到 500 个字符', 
      trigger: 'blur' 
    }
  ]
};

// Handle rate change (convert 5-star to 100-point scale)
const handleRateChange = (value) => {
  formData.value.score = value * 20; // Convert 0-5 to 0-100
};

// Watch internship prop
watch(() => props.internship, (newVal) => {
  if (newVal && newVal.id) {
    // If already evaluated, show existing scores
    if (newVal.enterprise_score) {
      formData.value.score = newVal.enterprise_score;
      rateValue.value = Math.round(newVal.enterprise_score / 20);
      formData.value.comment = newVal.enterprise_comment || '';
    } else {
      resetForm();
    }
  }
}, { immediate: true });

// Reset form
const resetForm = () => {
  formData.value = {
    score: 0,
    comment: ''
  };
  rateValue.value = 0;
  formRef.value?.clearValidate();
};

// Handle close
const handleClose = () => {
  dialogVisible.value = false;
  resetForm();
};

// Format date
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('zh-CN');
};

// Handle submit
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    
    submitting.value = true;
    
    const response = await submitEnterpriseEvaluation(props.internship.id, {
      score: formData.value.score,
      comment: formData.value.comment
    });

    if (response.success) {
      ElMessage.success('评价提交成功');
      emit('success');
      handleClose();
    }
  } catch (error) {
    if (error !== false) { // Not a validation error
      ElMessage.error(error.response?.data?.error?.message || '提交失败');
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.evaluation-info {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-rate) {
  height: 32px;
  line-height: 32px;
}

:deep(.el-rate__text) {
  font-size: 14px;
  margin-left: 10px;
}
</style>

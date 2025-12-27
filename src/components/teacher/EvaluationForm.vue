<template>
  <div class="evaluation-form">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="评分" prop="score">
        <el-rate
          v-model="form.score"
          :max="5"
          show-score
          score-template="{value} 分"
          style="margin-right: 16px"
        />
        <el-input-number
          v-model="form.score"
          :min="0"
          :max="100"
          :step="1"
          style="width: 150px"
        />
        <span style="margin-left: 8px; color: #909399">（0-100分）</span>
      </el-form-item>

      <el-form-item label="评价内容" prop="comment">
        <el-input
          v-model="form.comment"
          type="textarea"
          :rows="6"
          placeholder="请输入对学生实习表现的评价"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <div class="form-actions">
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="submitting"
      >
        提交评价
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  internshipId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['submit', 'cancel']);

// Form data
const formRef = ref(null);
const form = reactive({
  score: 0,
  comment: ''
});

const rules = {
  score: [
    { required: true, message: '请输入评分', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '评分必须在0-100之间', trigger: 'blur' }
  ],
  comment: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 20, message: '评价内容至少20个字符', trigger: 'blur' }
  ]
};

const submitting = ref(false);

// Methods
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    submitting.value = true;
    
    emit('submit', {
      internship_id: props.internshipId,
      teacher_score: form.score,
      teacher_comment: form.comment
    });
  } catch (error) {
    if (error !== false) {
      ElMessage.error('请完善表单信息');
    }
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  emit('cancel');
};

// Reset form
const resetForm = () => {
  formRef.value?.resetFields();
  form.score = 0;
  form.comment = '';
};

// Expose methods
defineExpose({
  resetForm
});
</script>

<style scoped>
.evaluation-form {
  padding: 16px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}
</style>

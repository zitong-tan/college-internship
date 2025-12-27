<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑岗位' : '发布新岗位'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="岗位名称" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入岗位名称"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="岗位描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入岗位描述"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="岗位要求" prop="requirements">
        <el-input
          v-model="formData.requirements"
          type="textarea"
          :rows="3"
          placeholder="请输入岗位要求"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="招聘名额" prop="total_slots">
        <el-input-number
          v-model="formData.total_slots"
          :min="1"
          :max="100"
          placeholder="请输入招聘名额"
        />
      </el-form-item>

      <el-form-item label="实习期限" prop="dateRange">
        <el-date-picker
          v-model="formData.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存' : '发布' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { createPosition, updatePosition } from '@/api/position';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:visible', 'success']);

const formRef = ref(null);
const submitting = ref(false);

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const isEdit = computed(() => !!props.position);

const formData = ref({
  title: '',
  description: '',
  requirements: '',
  total_slots: 1,
  dateRange: []
});

// Form validation rules
const rules = {
  title: [
    { required: true, message: '请输入岗位名称', trigger: 'blur' },
    { min: 2, max: 200, message: '岗位名称长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入岗位描述', trigger: 'blur' },
    { min: 10, max: 1000, message: '岗位描述长度在 10 到 1000 个字符', trigger: 'blur' }
  ],
  requirements: [
    { max: 500, message: '岗位要求不能超过 500 个字符', trigger: 'blur' }
  ],
  total_slots: [
    { required: true, message: '请输入招聘名额', trigger: 'blur' },
    { type: 'number', min: 1, max: 100, message: '招聘名额必须在 1 到 100 之间', trigger: 'blur' }
  ],
  dateRange: [
    { required: true, message: '请选择实习期限', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (!value || value.length !== 2) {
          callback(new Error('请选择完整的日期范围'));
        } else if (new Date(value[0]) >= new Date(value[1])) {
          callback(new Error('结束日期必须晚于开始日期'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

// Disable past dates
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000;
};

// Reset form
const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    requirements: '',
    total_slots: 1,
    dateRange: []
  };
  formRef.value?.clearValidate();
};

// Watch position prop to populate form
watch(() => props.position, (newVal) => {
  if (newVal) {
    formData.value = {
      title: newVal.title || '',
      description: newVal.description || '',
      requirements: newVal.requirements || '',
      total_slots: newVal.total_slots || 1,
      dateRange: [newVal.start_date, newVal.end_date]
    };
  } else {
    resetForm();
  }
}, { immediate: true });

// Handle close
const handleClose = () => {
  dialogVisible.value = false;
  resetForm();
};

// Handle submit
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    
    submitting.value = true;
    
    const submitData = {
      title: formData.value.title,
      description: formData.value.description,
      requirements: formData.value.requirements,
      total_slots: formData.value.total_slots,
      start_date: formData.value.dateRange[0],
      end_date: formData.value.dateRange[1]
    };

    let response;
    if (isEdit.value) {
      // Update existing position
      response = await updatePosition(props.position.id, submitData);
    } else {
      // Create new position
      // Set available_slots equal to total_slots for new positions
      submitData.available_slots = submitData.total_slots;
      response = await createPosition(submitData);
    }

    if (response.data.success) {
      ElMessage.success(isEdit.value ? '岗位更新成功' : '岗位发布成功');
      emit('success');
      handleClose();
    }
  } catch (error) {
    if (error !== false) { // Not a validation error
      ElMessage.error(error.response?.data?.error?.message || '操作失败');
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

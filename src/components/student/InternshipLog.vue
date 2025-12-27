<template>
  <div class="internship-log">
    <!-- Add Log Section -->
    <el-card class="add-log-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><EditPen /></el-icon>
          <span>提交实习日志</span>
        </div>
      </template>
      
      <el-form
        ref="logFormRef"
        :model="logForm"
        :rules="logRules"
        label-width="100px"
      >
        <el-form-item label="日志日期" prop="log_date">
          <el-date-picker
            v-model="logForm.log_date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="日志内容" prop="content">
          <el-input
            v-model="logForm.content"
            type="textarea"
            :rows="8"
            placeholder="请记录今天的实习工作内容、学习收获、遇到的问题等"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmitLog"
          >
            提交日志
          </el-button>
          <el-button @click="handleResetForm">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Logs List -->
    <el-card class="logs-list-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>日志记录 ({{ total }})</span>
        </div>
      </template>
      
      <div v-loading="loading" class="logs-list">
        <el-empty v-if="!loading && logs.length === 0" description="暂无日志记录" />
        
        <el-timeline v-if="logs.length > 0">
          <el-timeline-item
            v-for="log in logs"
            :key="log.id"
            :timestamp="formatDate(log.log_date)"
            placement="top"
          >
            <el-card class="log-item-card">
              <div class="log-header">
                <span class="log-date">{{ formatDate(log.log_date) }}</span>
                <span class="log-time">提交于 {{ formatDateTime(log.created_at) }}</span>
              </div>
              <div class="log-content">
                {{ log.content }}
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- Pagination -->
      <div v-if="total > pagination.pageSize" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { EditPen, Document } from '@element-plus/icons-vue';
import { submitLog, getLogs } from '@/api/internship';

const props = defineProps({
  internshipId: {
    type: [Number, String],
    required: true
  },
  startDate: {
    type: String,
    default: null
  },
  endDate: {
    type: String,
    default: null
  }
});

// State
const loading = ref(false);
const submitting = ref(false);
const logs = ref([]);
const total = ref(0);
const logFormRef = ref(null);

const logForm = reactive({
  log_date: '',
  content: ''
});

const logRules = {
  log_date: [
    { required: true, message: '请选择日志日期', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入日志内容', trigger: 'blur' },
    { min: 10, message: '日志内容至少10个字符', trigger: 'blur' }
  ]
};

const pagination = reactive({
  page: 1,
  pageSize: 10
});

// Methods
const fetchLogs = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    };
    
    const response = await getLogs(props.internshipId, params);
    if (response.success) {
      logs.value = response.data.logs || response.data.rows || [];
      total.value = response.data.total || 0;
    }
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    ElMessage.error('获取日志列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSubmitLog = async () => {
  if (!logFormRef.value) return;
  
  await logFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    submitting.value = true;
    try {
      const response = await submitLog(props.internshipId, logForm);
      
      if (response.success) {
        ElMessage.success('日志提交成功！');
        handleResetForm();
        
        // Refresh logs list
        pagination.page = 1;
        await fetchLogs();
      }
    } catch (error) {
      console.error('Failed to submit log:', error);
      const message = error.response?.data?.error?.message || '日志提交失败';
      ElMessage.error(message);
    } finally {
      submitting.value = false;
    }
  });
};

const handleResetForm = () => {
  if (logFormRef.value) {
    logFormRef.value.resetFields();
  }
  logForm.log_date = '';
  logForm.content = '';
};

const handlePageChange = (page) => {
  pagination.page = page;
  fetchLogs();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchLogs();
};

const disabledDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Disable future dates
  if (date > today) {
    return true;
  }
  
  // Disable dates before internship start
  if (props.startDate) {
    const start = new Date(props.startDate);
    start.setHours(0, 0, 0, 0);
    if (date < start) {
      return true;
    }
  }
  
  // Disable dates after internship end
  if (props.endDate) {
    const end = new Date(props.endDate);
    end.setHours(0, 0, 0, 0);
    if (date > end) {
      return true;
    }
  }
  
  return false;
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN');
};

const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('zh-CN');
};

// Lifecycle
onMounted(() => {
  fetchLogs();
});
</script>

<style scoped>
.internship-log {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.add-log-card {
  margin-bottom: 0;
}

.logs-list {
  min-height: 200px;
}

.log-item-card {
  margin-bottom: 0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #EBEEF5;
}

.log-date {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.log-time {
  font-size: 12px;
  color: #909399;
}

.log-content {
  color: #606266;
  line-height: 1.8;
  white-space: pre-wrap;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>

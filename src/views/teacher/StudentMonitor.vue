<template>
  <Layout>
    <div class="student-monitor-container">
      <!-- Header with filters -->
      <div class="header-section">
        <h1>学生监督</h1>
        <div class="filters">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索学生姓名或学号"
            clearable
            style="width: 300px; margin-right: 16px"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-select
            v-model="statusFilter"
            placeholder="实习状态"
            clearable
            style="width: 150px; margin-left: 16px"
            @change="handleSearch"
          >
            <el-option label="进行中" value="ongoing" />
            <el-option label="待评价" value="pending_evaluation" />
            <el-option label="已完成" value="completed" />
          </el-select>
          <el-button
            type="default"
            style="margin-left: 16px"
            @click="resetFilters"
          >
            重置
          </el-button>
        </div>
      </div>

      <!-- Internships List -->
      <div class="internships-list" v-loading="loading">
        <el-empty
          v-if="!loading && internships.length === 0"
          description="暂无实习记录"
        />
        
        <el-card
          v-for="internship in internships"
          :key="internship.id"
          class="internship-card"
          shadow="hover"
        >
          <div class="internship-content">
            <div class="internship-info">
              <div class="info-row">
                <span class="label">学生姓名：</span>
                <span class="value">{{ internship.Student?.User?.real_name || '未知' }}</span>
              </div>
              <div class="info-row">
                <span class="label">学号：</span>
                <span class="value">{{ internship.Student?.student_number || '未知' }}</span>
              </div>
              <div class="info-row">
                <span class="label">岗位名称：</span>
                <span class="value">{{ internship.Position?.title || '未知' }}</span>
              </div>
              <div class="info-row">
                <span class="label">企业名称：</span>
                <span class="value">{{ internship.Enterprise?.company_name || '未知' }}</span>
              </div>
              <div class="info-row">
                <span class="label">实习期限：</span>
                <span class="value">
                  {{ formatDate(internship.start_date) }} 至 {{ formatDate(internship.end_date) }}
                </span>
              </div>
              <div class="info-row">
                <span class="label">实习状态：</span>
                <el-tag :type="getStatusType(internship.status)">
                  {{ getStatusText(internship.status) }}
                </el-tag>
              </div>
            </div>
            <div class="internship-actions">
              <el-button
                type="primary"
                size="default"
                @click="viewDetail(internship)"
              >
                查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- Pagination -->
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>

      <!-- Detail Dialog -->
      <el-dialog
        v-model="detailDialogVisible"
        title="实习详情"
        width="900px"
        :close-on-click-modal="false"
      >
        <div v-if="selectedInternship" class="detail-content">
          <el-tabs v-model="activeTab">
            <!-- Basic Info Tab -->
            <el-tab-pane label="基本信息" name="info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="学生姓名">
                  {{ selectedInternship.Student?.User?.real_name || '未知' }}
                </el-descriptions-item>
                <el-descriptions-item label="学号">
                  {{ selectedInternship.Student?.student_number || '未知' }}
                </el-descriptions-item>
                <el-descriptions-item label="专业">
                  {{ selectedInternship.Student?.major || '未知' }}
                </el-descriptions-item>
                <el-descriptions-item label="年级">
                  {{ selectedInternship.Student?.grade || '未知' }}
                </el-descriptions-item>
                <el-descriptions-item label="岗位名称" :span="2">
                  {{ selectedInternship.Position?.title || '未知' }}
                </el-descriptions-item>
                <el-descriptions-item label="企业名称" :span="2">
                  {{ selectedInternship.Enterprise?.company_name || '未知' }}
                </el-descriptions-item>
                <el-descriptions-item label="实习期限" :span="2">
                  {{ formatDate(selectedInternship.start_date) }} 至 
                  {{ formatDate(selectedInternship.end_date) }}
                </el-descriptions-item>
                <el-descriptions-item label="实习状态" :span="2">
                  <el-tag :type="getStatusType(selectedInternship.status)">
                    {{ getStatusText(selectedInternship.status) }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>

            <!-- Logs Tab -->
            <el-tab-pane label="实习日志" name="logs">
              <div v-loading="logsLoading">
                <el-empty
                  v-if="!logsLoading && logs.length === 0"
                  description="暂无日志记录"
                />
                <el-timeline v-else>
                  <el-timeline-item
                    v-for="log in logs"
                    :key="log.id"
                    :timestamp="formatDate(log.log_date)"
                    placement="top"
                  >
                    <el-card>
                      <div class="log-content">
                        {{ log.content }}
                      </div>
                      <div class="log-meta">
                        提交时间: {{ formatDate(log.created_at) }}
                      </div>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-tab-pane>

            <!-- Files Tab -->
            <el-tab-pane label="上传文件" name="files">
              <div v-loading="filesLoading">
                <el-empty
                  v-if="!filesLoading && files.length === 0"
                  description="暂无上传文件"
                />
                <el-table v-else :data="files" stripe>
                  <el-table-column prop="file_name" label="文件名" min-width="200" />
                  <el-table-column prop="file_type" label="文件类型" width="120" />
                  <el-table-column label="文件大小" width="120">
                    <template #default="{ row }">
                      {{ formatFileSize(row.file_size) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="上传时间" width="180">
                    <template #default="{ row }">
                      {{ formatDate(row.uploaded_at) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120">
                    <template #default="{ row }">
                      <el-button
                        type="primary"
                        size="small"
                        @click="downloadFile(row)"
                      >
                        下载
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>

            <!-- Evaluation Tab -->
            <el-tab-pane
              label="提交评价"
              name="evaluation"
              v-if="selectedInternship?.status === 'pending_evaluation' || selectedInternship?.status === 'completed'"
            >
              <div v-if="selectedInternship.teacher_score">
                <el-alert
                  title="您已提交评价"
                  type="success"
                  :closable="false"
                  style="margin-bottom: 16px"
                />
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="教师评分">
                    {{ selectedInternship.teacher_score }} 分
                  </el-descriptions-item>
                  <el-descriptions-item label="教师评语">
                    <div class="evaluation-comment">
                      {{ selectedInternship.teacher_comment }}
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item
                    v-if="selectedInternship.enterprise_score"
                    label="企业评分"
                  >
                    {{ selectedInternship.enterprise_score }} 分
                  </el-descriptions-item>
                  <el-descriptions-item
                    v-if="selectedInternship.enterprise_comment"
                    label="企业评语"
                  >
                    <div class="evaluation-comment">
                      {{ selectedInternship.enterprise_comment }}
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item
                    v-if="selectedInternship.final_score"
                    label="综合评分"
                  >
                    <el-tag type="success" size="large">
                      {{ selectedInternship.final_score }} 分
                    </el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              <div v-else>
                <el-alert
                  title="请对学生的实习表现进行评价"
                  type="info"
                  :closable="false"
                  style="margin-bottom: 16px"
                />
                <EvaluationForm
                  ref="evaluationFormRef"
                  :internship-id="selectedInternship.id"
                  @submit="handleEvaluationSubmit"
                  @cancel="detailDialogVisible = false"
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <template #footer>
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import Layout from '@/components/common/Layout.vue';
import EvaluationForm from '@/components/teacher/EvaluationForm.vue';
import { getInternships, getLogs, getFiles, submitTeacherEvaluation } from '@/api/internship';

// Data
const loading = ref(false);
const internships = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchKeyword = ref('');
const statusFilter = ref('');

// Detail dialog
const detailDialogVisible = ref(false);
const selectedInternship = ref(null);
const activeTab = ref('info');

// Logs
const logsLoading = ref(false);
const logs = ref([]);

// Files
const filesLoading = ref(false);
const files = ref([]);

// Evaluation
const evaluationFormRef = ref(null);

// Methods
const fetchInternships = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    };
    
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value;
    }
    
    if (statusFilter.value) {
      params.status = statusFilter.value;
    }
    
    const response = await getInternships(params);
    internships.value = response.data.internships || [];
    total.value = response.data.total || 0;
  } catch (error) {
    console.error('Failed to fetch internships:', error);
    ElMessage.error('获取实习列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchInternships();
};

const resetFilters = () => {
  searchKeyword.value = '';
  statusFilter.value = '';
  currentPage.value = 1;
  fetchInternships();
};

const viewDetail = (internship) => {
  selectedInternship.value = internship;
  detailDialogVisible.value = true;
  activeTab.value = 'info';
};

const fetchLogs = async () => {
  if (!selectedInternship.value) return;
  
  logsLoading.value = true;
  try {
    const response = await getLogs(selectedInternship.value.id);
    logs.value = response.data.logs || [];
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    ElMessage.error('获取日志失败');
  } finally {
    logsLoading.value = false;
  }
};

const fetchFiles = async () => {
  if (!selectedInternship.value) return;
  
  filesLoading.value = true;
  try {
    const response = await getFiles(selectedInternship.value.id);
    files.value = response.data.files || [];
  } catch (error) {
    console.error('Failed to fetch files:', error);
    ElMessage.error('获取文件列表失败');
  } finally {
    filesLoading.value = false;
  }
};

const downloadFile = (file) => {
  // Create a temporary link to download the file
  const link = document.createElement('a');
  link.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}${file.file_path}`;
  link.download = file.file_name;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleEvaluationSubmit = async (data) => {
  try {
    await submitTeacherEvaluation(data.internship_id, {
      score: data.teacher_score,
      comment: data.teacher_comment
    });
    ElMessage.success('评价提交成功');
    detailDialogVisible.value = false;
    fetchInternships();
  } catch (error) {
    console.error('Failed to submit evaluation:', error);
    ElMessage.error(error.response?.data?.error?.message || '评价提交失败');
  }
};

const formatDate = (date) => {
  if (!date) return '未知';
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const getStatusType = (status) => {
  const typeMap = {
    ongoing: 'primary',
    pending_evaluation: 'warning',
    completed: 'success'
  };
  return typeMap[status] || 'info';
};

const getStatusText = (status) => {
  const textMap = {
    ongoing: '进行中',
    pending_evaluation: '待评价',
    completed: '已完成'
  };
  return textMap[status] || '未知';
};

// Watch for tab changes to load data
watch(activeTab, (newTab) => {
  if (newTab === 'logs' && logs.value.length === 0) {
    fetchLogs();
  } else if (newTab === 'files' && files.value.length === 0) {
    fetchFiles();
  }
});

// Watch for dialog visibility
watch(detailDialogVisible, (visible) => {
  if (!visible) {
    logs.value = [];
    files.value = [];
    evaluationFormRef.value?.resetForm();
  }
});

// Lifecycle
onMounted(() => {
  fetchInternships();
});
</script>

<style scoped>
.student-monitor-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 24px;
}

.header-section h1 {
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 600;
}

.filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.internships-list {
  min-height: 400px;
}

.internship-card {
  margin-bottom: 16px;
}

.internship-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.internship-info {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
}

.info-row .label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
  min-width: 80px;
}

.info-row .value {
  color: #303133;
}

.internship-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 24px;
}

.internship-actions .el-button {
  width: 100px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.detail-content {
  margin-top: 16px;
}

.log-content {
  white-space: pre-wrap;
  line-height: 1.6;
  margin-bottom: 8px;
}

.log-meta {
  font-size: 12px;
  color: #909399;
}

.evaluation-comment {
  white-space: pre-wrap;
  line-height: 1.6;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .internship-info {
    grid-template-columns: 1fr;
  }
  
  .internship-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .internship-actions {
    margin-left: 0;
    margin-top: 16px;
    flex-direction: row;
    width: 100%;
  }
  
  .internship-actions .el-button {
    flex: 1;
  }
}
</style>

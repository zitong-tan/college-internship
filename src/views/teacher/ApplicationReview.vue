<template>
  <Layout>
    <div class="application-review-container">
      <!-- Header with filters -->
      <div class="header-section">
        <h1>申请审批</h1>
        <div class="filters">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索学生姓名或岗位名称"
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
            placeholder="申请状态"
            clearable
            style="width: 150px; margin-left: 16px"
            @change="handleSearch"
          >
            <el-option label="待审批" value="pending" />
            <el-option label="已批准" value="approved" />
            <el-option label="已拒绝" value="rejected" />
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

      <!-- Applications List -->
      <div class="applications-list" v-loading="loading">
        <el-empty
          v-if="!loading && applications.length === 0"
          description="暂无申请记录"
        />
        
        <el-card
          v-for="application in applications"
          :key="application.id"
          class="application-card"
          shadow="hover"
        >
          <div class="application-content">
            <div class="application-info">
              <div class="info-row">
                <span class="label">学生姓名：</span>
                <span class="value">{{ application.Student?.User?.real_name || '未知' }}</span>
              </div>
              <div class="info-row">
                <span class="label">学号：</span>
                <span class="value">{{ application.Student?.student_number || '未知' }}</span>
              </div>
              <div class="info-row">
                <span class="label">岗位名称：</span>
                <span class="value">{{ application.Position?.title || '未知' }}</span>
              </div>
              <div class="info-row">
                <span class="label">企业名称：</span>
                <span class="value">{{ application.Position?.Enterprise?.company_name || '未知' }}</span>
              </div>
              <div class="info-row">
                <span class="label">申请时间：</span>
                <span class="value">{{ formatDate(application.applied_at) }}</span>
              </div>
              <div class="info-row">
                <span class="label">申请状态：</span>
                <el-tag :type="getStatusType(application.status)">
                  {{ getStatusText(application.status) }}
                </el-tag>
              </div>
            </div>
            <div class="application-actions">
              <el-button
                type="primary"
                size="default"
                @click="viewDetail(application)"
              >
                查看详情
              </el-button>
              <el-button
                v-if="application.status === 'pending'"
                type="success"
                size="default"
                @click="handleApprove(application)"
              >
                批准
              </el-button>
              <el-button
                v-if="application.status === 'pending'"
                type="danger"
                size="default"
                @click="handleReject(application)"
              >
                拒绝
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
        title="申请详情"
        width="700px"
        :close-on-click-modal="false"
      >
        <div v-if="selectedApplication" class="detail-content">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="学生姓名">
              {{ selectedApplication.Student?.User?.real_name || '未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="学号">
              {{ selectedApplication.Student?.student_number || '未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="专业">
              {{ selectedApplication.Student?.major || '未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="年级">
              {{ selectedApplication.Student?.grade || '未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="联系方式" :span="2">
              {{ selectedApplication.contact_info || '未提供' }}
            </el-descriptions-item>
            <el-descriptions-item label="岗位名称" :span="2">
              {{ selectedApplication.Position?.title || '未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="企业名称" :span="2">
              {{ selectedApplication.Position?.Enterprise?.company_name || '未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="实习期限" :span="2">
              {{ formatDate(selectedApplication.Position?.start_date) }} 至 
              {{ formatDate(selectedApplication.Position?.end_date) }}
            </el-descriptions-item>
            <el-descriptions-item label="申请时间" :span="2">
              {{ formatDate(selectedApplication.applied_at) }}
            </el-descriptions-item>
            <el-descriptions-item label="申请状态" :span="2">
              <el-tag :type="getStatusType(selectedApplication.status)">
                {{ getStatusText(selectedApplication.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="个人陈述" :span="2">
              <div class="personal-statement">
                {{ selectedApplication.personal_statement || '未提供' }}
              </div>
            </el-descriptions-item>
            <el-descriptions-item
              v-if="selectedApplication.status === 'rejected'"
              label="拒绝原因"
              :span="2"
            >
              <div class="rejection-reason">
                {{ selectedApplication.rejection_reason || '未提供' }}
              </div>
            </el-descriptions-item>
            <el-descriptions-item
              v-if="selectedApplication.reviewed_at"
              label="审批时间"
              :span="2"
            >
              {{ formatDate(selectedApplication.reviewed_at) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="detailDialogVisible = false">关闭</el-button>
            <el-button
              v-if="selectedApplication?.status === 'pending'"
              type="success"
              @click="handleApprove(selectedApplication)"
            >
              批准申请
            </el-button>
            <el-button
              v-if="selectedApplication?.status === 'pending'"
              type="danger"
              @click="handleReject(selectedApplication)"
            >
              拒绝申请
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- Reject Dialog -->
      <el-dialog
        v-model="rejectDialogVisible"
        title="拒绝申请"
        width="500px"
        :close-on-click-modal="false"
      >
        <el-form :model="rejectForm" :rules="rejectRules" ref="rejectFormRef">
          <el-form-item label="拒绝原因" prop="reason">
            <el-input
              v-model="rejectForm.reason"
              type="textarea"
              :rows="4"
              placeholder="请输入拒绝原因"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmReject" :loading="submitting">
            确认拒绝
          </el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import Layout from '@/components/common/Layout.vue';
import { getApplications, approveApplication, rejectApplication } from '@/api/application';

// Data
const loading = ref(false);
const applications = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchKeyword = ref('');
const statusFilter = ref('pending'); // Default to pending applications

// Detail dialog
const detailDialogVisible = ref(false);
const selectedApplication = ref(null);

// Reject dialog
const rejectDialogVisible = ref(false);
const rejectFormRef = ref(null);
const rejectForm = ref({
  reason: ''
});
const rejectRules = {
  reason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' },
    { min: 10, message: '拒绝原因至少10个字符', trigger: 'blur' }
  ]
};
const submitting = ref(false);
const applicationToReject = ref(null);

// Methods
const fetchApplications = async () => {
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
    
    const response = await getApplications(params);
    applications.value = response.data.applications || [];
    total.value = response.data.total || 0;
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    ElMessage.error('获取申请列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchApplications();
};

const resetFilters = () => {
  searchKeyword.value = '';
  statusFilter.value = 'pending';
  currentPage.value = 1;
  fetchApplications();
};

const viewDetail = (application) => {
  selectedApplication.value = application;
  detailDialogVisible.value = true;
};

const handleApprove = async (application) => {
  try {
    await ElMessageBox.confirm(
      `确认批准学生 ${application.Student?.User?.real_name} 的申请吗？`,
      '批准申请',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await approveApplication(application.id);
    ElMessage.success('申请已批准');
    detailDialogVisible.value = false;
    fetchApplications();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to approve application:', error);
      ElMessage.error(error.response?.data?.error?.message || '批准申请失败');
    }
  }
};

const handleReject = (application) => {
  applicationToReject.value = application;
  rejectForm.value.reason = '';
  rejectDialogVisible.value = true;
};

const confirmReject = async () => {
  try {
    await rejectFormRef.value.validate();
    submitting.value = true;
    
    await rejectApplication(applicationToReject.value.id, rejectForm.value.reason);
    ElMessage.success('申请已拒绝');
    rejectDialogVisible.value = false;
    detailDialogVisible.value = false;
    fetchApplications();
  } catch (error) {
    if (error !== false) {
      console.error('Failed to reject application:', error);
      ElMessage.error(error.response?.data?.error?.message || '拒绝申请失败');
    }
  } finally {
    submitting.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return '未知';
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  };
  return typeMap[status] || 'info';
};

const getStatusText = (status) => {
  const textMap = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已拒绝'
  };
  return textMap[status] || '未知';
};

// Lifecycle
onMounted(() => {
  fetchApplications();
});
</script>

<style scoped>
.application-review-container {
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

.applications-list {
  min-height: 400px;
}

.application-card {
  margin-bottom: 16px;
}

.application-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.application-info {
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

.application-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 24px;
}

.application-actions .el-button {
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

.personal-statement,
.rejection-reason {
  white-space: pre-wrap;
  line-height: 1.6;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 768px) {
  .application-info {
    grid-template-columns: 1fr;
  }
  
  .application-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .application-actions {
    margin-left: 0;
    margin-top: 16px;
    flex-direction: row;
    width: 100%;
  }
  
  .application-actions .el-button {
    flex: 1;
  }
}
</style>

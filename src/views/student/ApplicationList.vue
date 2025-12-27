<template>
  <Layout>
    <div class="page-container">
      <h1>我的申请</h1>
      
      <!-- Filter Section -->
      <el-card class="filter-card" shadow="never">
        <el-form :inline="true" :model="filters" class="filter-form">
          <el-form-item label="状态">
            <el-select
              v-model="filters.status"
              placeholder="选择状态"
              clearable
              style="width: 150px"
              @change="handleSearch"
            >
              <el-option label="待审批" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- Applications List -->
      <div v-loading="loading" class="applications-list">
        <el-empty v-if="!loading && applications.length === 0" description="暂无申请记录" />
        
        <el-card
          v-for="application in applications"
          :key="application.id"
          class="application-card"
          shadow="hover"
        >
          <div class="application-header">
            <div class="title-section">
              <h3 class="position-title">{{ application.Position?.title || '未知岗位' }}</h3>
              <el-tag
                :type="getStatusType(application.status)"
                size="small"
              >
                {{ getStatusText(application.status) }}
              </el-tag>
            </div>
            <div class="company-name">
              <el-icon><OfficeBuilding /></el-icon>
              {{ application.Position?.Enterprise?.company_name || '未知企业' }}
            </div>
          </div>
          
          <div class="application-content">
            <div class="info-grid">
              <div class="info-item">
                <span class="label">申请时间:</span>
                <span class="value">{{ formatDateTime(application.applied_at) }}</span>
              </div>
              <div class="info-item" v-if="application.reviewed_at">
                <span class="label">审批时间:</span>
                <span class="value">{{ formatDateTime(application.reviewed_at) }}</span>
              </div>
              <div class="info-item" v-if="application.reviewer_name">
                <span class="label">审批人:</span>
                <span class="value">{{ application.reviewer_name }}</span>
              </div>
            </div>
            
            <div v-if="application.personal_statement" class="statement-section">
              <div class="section-label">个人简介:</div>
              <div class="statement-content">{{ application.personal_statement }}</div>
            </div>
            
            <div v-if="application.rejection_reason" class="rejection-section">
              <el-alert
                type="error"
                :closable="false"
                show-icon
              >
                <template #title>
                  拒绝原因
                </template>
                {{ application.rejection_reason }}
              </el-alert>
            </div>
          </div>
          
          <div class="application-footer">
            <el-button
              size="small"
              @click="viewPosition(application.position_id)"
            >
              查看岗位
            </el-button>
            <el-button
              v-if="application.status === 'approved' && application.internship_id"
              type="primary"
              size="small"
              @click="viewInternship(application.internship_id)"
            >
              查看实习
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- Pagination -->
      <div v-if="total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search, OfficeBuilding } from '@element-plus/icons-vue';
import Layout from '@/components/common/Layout.vue';
import { getApplications } from '@/api/application';

const router = useRouter();

// State
const loading = ref(false);
const applications = ref([]);
const total = ref(0);

const filters = reactive({
  status: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 10
});

// Methods
const fetchApplications = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters
    };
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });
    
    const response = await getApplications(params);
    if (response.success) {
      applications.value = response.data.applications || response.data.rows || [];
      total.value = response.data.total || 0;
    }
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    ElMessage.error('获取申请列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchApplications();
};

const handleReset = () => {
  filters.status = '';
  pagination.page = 1;
  fetchApplications();
};

const handlePageChange = (page) => {
  pagination.page = page;
  fetchApplications();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchApplications();
};

const viewPosition = (positionId) => {
  router.push(`/student/positions/${positionId}`);
};

const viewInternship = (internshipId) => {
  router.push(`/student/internships/${internshipId}`);
};

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  };
  return types[status] || 'info';
};

const getStatusText = (status) => {
  const texts = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  };
  return texts[status] || status;
};

const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('zh-CN');
};

// Lifecycle
onMounted(() => {
  fetchApplications();
});
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 24px;
  color: #303133;
}

.filter-card {
  margin-bottom: 24px;
}

.filter-form {
  margin: 0;
}

.applications-list {
  min-height: 400px;
}

.application-card {
  margin-bottom: 16px;
}

.application-header {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #EBEEF5;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.position-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.company-name {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
}

.application-content {
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  font-size: 14px;
}

.info-item .label {
  color: #909399;
  min-width: 80px;
}

.info-item .value {
  color: #606266;
}

.statement-section {
  margin-bottom: 16px;
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.statement-content {
  padding: 12px;
  background: #F5F7FA;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.rejection-section {
  margin-bottom: 16px;
}

.application-footer {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #EBEEF5;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>

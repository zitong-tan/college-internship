<template>
  <Layout>
    <div class="page-container">
      <h1>我的实习</h1>
      
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
              <el-option label="进行中" value="ongoing" />
              <el-option label="待评价" value="pending_evaluation" />
              <el-option label="已完成" value="completed" />
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

      <!-- Internships List -->
      <div v-loading="loading" class="internships-list">
        <el-empty v-if="!loading && internships.length === 0" description="暂无实习记录" />
        
        <el-card
          v-for="internship in internships"
          :key="internship.id"
          class="internship-card"
          shadow="hover"
          @click="viewDetail(internship.id)"
        >
          <div class="internship-header">
            <div class="title-section">
              <h3 class="position-title">{{ internship.Position?.title || '实习' }}</h3>
              <el-tag
                :type="getStatusType(internship.status)"
                size="small"
              >
                {{ getStatusText(internship.status) }}
              </el-tag>
            </div>
            <div class="company-name">
              <el-icon><OfficeBuilding /></el-icon>
              {{ internship.Enterprise?.company_name || '未知企业' }}
            </div>
          </div>
          
          <div class="internship-content">
            <div class="info-grid">
              <div class="info-item">
                <span class="label">开始日期:</span>
                <span class="value">{{ formatDate(internship.start_date) }}</span>
              </div>
              <div class="info-item">
                <span class="label">结束日期:</span>
                <span class="value">{{ formatDate(internship.end_date) }}</span>
              </div>
              <div class="info-item" v-if="internship.teacher_name">
                <span class="label">指导教师:</span>
                <span class="value">{{ internship.teacher_name }}</span>
              </div>
              <div class="info-item" v-if="internship.final_score !== null">
                <span class="label">综合评分:</span>
                <span class="value score">{{ internship.final_score }} 分</span>
              </div>
            </div>
            
            <!-- Progress Bar -->
            <div class="progress-section">
              <div class="progress-label">实习进度</div>
              <el-progress
                :percentage="calculateProgress(internship)"
                :color="getProgressColor(calculateProgress(internship))"
              />
            </div>
          </div>
          
          <div class="internship-footer">
            <el-button
              type="primary"
              size="small"
              @click.stop="viewDetail(internship.id)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="internship.status === 'ongoing'"
              size="small"
              @click.stop="submitLog(internship.id)"
            >
              提交日志
            </el-button>
            <el-button
              v-if="internship.status === 'completed'"
              size="small"
              @click.stop="viewEvaluation(internship.id)"
            >
              查看评价
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
import { getInternships } from '@/api/internship';

const router = useRouter();

// State
const loading = ref(false);
const internships = ref([]);
const total = ref(0);

const filters = reactive({
  status: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 10
});

// Methods
const fetchInternships = async () => {
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
    
    const response = await getInternships(params);
    if (response.success) {
      internships.value = response.data.internships || response.data.rows || [];
      total.value = response.data.total || 0;
    }
  } catch (error) {
    console.error('Failed to fetch internships:', error);
    ElMessage.error('获取实习列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchInternships();
};

const handleReset = () => {
  filters.status = '';
  pagination.page = 1;
  fetchInternships();
};

const handlePageChange = (page) => {
  pagination.page = page;
  fetchInternships();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchInternships();
};

const viewDetail = (id) => {
  router.push(`/student/internships/${id}`);
};

const submitLog = (id) => {
  router.push({
    path: `/student/internships/${id}`,
    query: { tab: 'logs' }
  });
};

const viewEvaluation = (id) => {
  router.push({
    path: `/student/internships/${id}`,
    query: { tab: 'evaluation' }
  });
};

const calculateProgress = (internship) => {
  const start = new Date(internship.start_date);
  const end = new Date(internship.end_date);
  const today = new Date();
  
  if (today < start) return 0;
  if (today > end) return 100;
  
  const total = end - start;
  const completed = today - start;
  
  return Math.min(Math.round((completed / total) * 100), 100);
};

const getProgressColor = (percentage) => {
  if (percentage < 30) return '#67C23A';
  if (percentage < 70) return '#409EFF';
  if (percentage < 90) return '#E6A23C';
  return '#F56C6C';
};

const getStatusType = (status) => {
  const types = {
    ongoing: 'success',
    pending_evaluation: 'warning',
    completed: 'info'
  };
  return types[status] || 'info';
};

const getStatusText = (status) => {
  const texts = {
    ongoing: '进行中',
    pending_evaluation: '待评价',
    completed: '已完成'
  };
  return texts[status] || status;
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN');
};

// Lifecycle
onMounted(() => {
  fetchInternships();
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

.internships-list {
  min-height: 400px;
}

.internship-card {
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.internship-card:hover {
  transform: translateY(-2px);
}

.internship-header {
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

.internship-content {
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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

.info-item .value.score {
  font-weight: 600;
  color: #409EFF;
}

.progress-section {
  margin-top: 16px;
}

.progress-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.internship-footer {
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

<template>
  <Layout>
    <div class="page-container">
      <el-page-header @back="goBack" title="返回">
        <template #content>
          <span class="page-title">实习详情</span>
        </template>
      </el-page-header>

      <div v-loading="loading" class="detail-content">
        <el-empty v-if="!loading && !internship" description="实习记录不存在" />
        
        <template v-if="internship">
          <!-- Internship Header -->
          <el-card class="header-card" shadow="never">
            <div class="internship-header">
              <div class="title-section">
                <h1 class="internship-title">{{ internship.position_title || '实习' }}</h1>
                <el-tag
                  :type="getStatusType(internship.status)"
                  size="large"
                >
                  {{ getStatusText(internship.status) }}
                </el-tag>
              </div>
              
              <div class="company-info">
                <el-icon class="company-icon"><OfficeBuilding /></el-icon>
                <span class="company-name">{{ internship.enterprise?.company_name || '未知企业' }}</span>
              </div>
              
              <div class="quick-info">
                <div class="info-item">
                  <el-icon><Calendar /></el-icon>
                  <span>实习期限: {{ formatDate(internship.start_date) }} 至 {{ formatDate(internship.end_date) }}</span>
                </div>
                <div class="info-item" v-if="internship.teacher_name">
                  <el-icon><User /></el-icon>
                  <span>指导教师: {{ internship.teacher_name }}</span>
                </div>
              </div>
            </div>
          </el-card>

          <!-- Tabs for different sections -->
          <el-card class="tabs-card" shadow="never">
            <el-tabs v-model="activeTab" type="border-card">
              <!-- Progress Tab -->
              <el-tab-pane label="实习进度" name="progress">
                <InternshipProgress
                  :start-date="internship.start_date"
                  :end-date="internship.end_date"
                  :status="internship.status"
                />
              </el-tab-pane>
              
              <!-- Logs Tab -->
              <el-tab-pane label="实习日志" name="logs">
                <InternshipLog
                  :internship-id="internship.id"
                  :start-date="internship.start_date"
                  :end-date="internship.end_date"
                />
              </el-tab-pane>
              
              <!-- Files Tab -->
              <el-tab-pane label="文件管理" name="files">
                <FileUpload :internship-id="internship.id" />
              </el-tab-pane>
              
              <!-- Evaluation Tab -->
              <el-tab-pane label="实习评价" name="evaluation">
                <EvaluationView
                  :internship-id="internship.id"
                  :teacher-score="internship.teacher_score"
                  :enterprise-score="internship.enterprise_score"
                  :final-score="internship.final_score"
                  :teacher-comment="internship.teacher_comment"
                  :enterprise-comment="internship.enterprise_comment"
                />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </template>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { OfficeBuilding, Calendar, User } from '@element-plus/icons-vue';
import Layout from '@/components/common/Layout.vue';
import InternshipProgress from '@/components/student/InternshipProgress.vue';
import InternshipLog from '@/components/student/InternshipLog.vue';
import FileUpload from '@/components/student/FileUpload.vue';
import EvaluationView from '@/components/student/EvaluationView.vue';
import { getInternship } from '@/api/internship';

const route = useRoute();
const router = useRouter();

// State
const loading = ref(false);
const internship = ref(null);
const activeTab = ref('progress');

// Methods
const fetchInternship = async () => {
  loading.value = true;
  try {
    const response = await getInternship(route.params.id);
    if (response.success) {
      internship.value = response.data;
      
      // Set default tab based on status
      if (internship.value.status === 'pending_evaluation' || internship.value.status === 'completed') {
        activeTab.value = 'evaluation';
      }
    }
  } catch (error) {
    console.error('Failed to fetch internship:', error);
    ElMessage.error('获取实习详情失败');
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
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
  fetchInternship();
});
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.detail-content {
  margin-top: 24px;
  min-height: 400px;
}

.header-card {
  margin-bottom: 24px;
}

.internship-header {
  padding: 8px 0;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.internship-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #EBEEF5;
}

.company-icon {
  font-size: 20px;
  color: #409EFF;
}

.company-name {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.quick-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.tabs-card {
  margin-bottom: 24px;
}

.tabs-card :deep(.el-card__body) {
  padding: 0;
}

.tabs-card :deep(.el-tabs--border-card) {
  border: none;
  box-shadow: none;
}

.tabs-card :deep(.el-tabs__content) {
  padding: 24px;
}
</style>

<template>
  <Layout>
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>学生工作台</h1>
        <p>Student Dashboard</p>
      </div>
      
      <div v-loading="loading" class="dashboard-content">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-card shadow="hover" class="stat-card" @click="$router.push('/student/applications')">
              <div class="stat-content">
                <el-icon class="stat-icon" color="#409eff"><Document /></el-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.applications }}</div>
                  <div class="stat-label">我的申请</div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6">
            <el-card shadow="hover" class="stat-card" @click="$router.push('/student/internships')">
              <div class="stat-content">
                <el-icon class="stat-icon" color="#67c23a"><Briefcase /></el-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.ongoingInternships }}</div>
                  <div class="stat-label">实习中</div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6">
            <el-card shadow="hover" class="stat-card" @click="$router.push('/student/positions')">
              <div class="stat-content">
                <el-icon class="stat-icon" color="#e6a23c"><Position /></el-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.availablePositions }}</div>
                  <div class="stat-label">可用岗位</div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6">
            <el-card shadow="hover" class="stat-card" @click="$router.push('/notifications')">
              <div class="stat-content">
                <el-icon class="stat-icon" color="#f56c6c"><Bell /></el-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.unreadNotifications }}</div>
                  <div class="stat-label">未读通知</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>快速操作</span>
                </div>
              </template>
              <div class="quick-actions">
                <el-button type="primary" @click="$router.push('/student/positions')">
                  浏览岗位
                </el-button>
                <el-button @click="$router.push('/student/applications')">
                  我的申请
                </el-button>
                <el-button @click="$router.push('/student/internships')">
                  我的实习
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import Layout from '@/components/common/Layout.vue';
import { Document, Briefcase, Position, Bell } from '@element-plus/icons-vue';
import { getApplications } from '@/api/application';
import { getInternships } from '@/api/internship';
import { getPositions } from '@/api/position';
import { getNotifications } from '@/api/notification';

const loading = ref(false);
const stats = ref({
  applications: 0,
  ongoingInternships: 0,
  availablePositions: 0,
  unreadNotifications: 0
});

const fetchStats = async () => {
  loading.value = true;
  try {
    // Fetch all data in parallel
    const [applicationsRes, internshipsRes, positionsRes, notificationsRes] = await Promise.all([
      getApplications().catch(() => ({ success: false, data: { total: 0 } })),
      getInternships().catch(() => ({ success: false, data: { total: 0 } })),
      getPositions({ status: 'open' }).catch(() => ({ success: false, data: { pagination: { total: 0 } } })),
      getNotifications({ is_read: false }).catch(() => ({ success: false, data: { total: 0 } }))
    ]);

    // Update stats
    stats.value.applications = applicationsRes.data?.total || 0;
    
    // Count ongoing internships
    const internships = internshipsRes.data?.internships || [];
    stats.value.ongoingInternships = internships.filter(i => i.status === 'ongoing').length;
    
    // Get available positions count
    stats.value.availablePositions = positionsRes.data?.pagination?.total || 0;
    
    // Get unread notifications count
    stats.value.unreadNotifications = notificationsRes.data?.total || 0;
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    ElMessage.error('获取统计数据失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h1 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 8px 0;
}

.dashboard-header p {
  color: #909399;
  margin: 0;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 48px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.card-header {
  font-weight: 600;
  font-size: 16px;
}

.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>

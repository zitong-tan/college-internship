<template>
  <Layout>
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>企业工作台</h1>
        <p>Enterprise Dashboard</p>
      </div>
      
      <div v-loading="loading" class="dashboard-content">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-card shadow="hover" class="stat-card" @click="$router.push('/enterprise/positions')">
              <div class="stat-content">
                <el-icon class="stat-icon" color="#409eff"><Position /></el-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.totalPositions }}</div>
                  <div class="stat-label">发布岗位</div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6">
            <el-card shadow="hover" class="stat-card" @click="$router.push('/enterprise/students')">
              <div class="stat-content">
                <el-icon class="stat-icon" color="#67c23a"><User /></el-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.internshipStudents }}</div>
                  <div class="stat-label">实习学生</div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6">
            <el-card shadow="hover" class="stat-card" @click="$router.push('/enterprise/students')">
              <div class="stat-content">
                <el-icon class="stat-icon" color="#e6a23c"><Edit /></el-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.pendingEvaluations }}</div>
                  <div class="stat-label">待评价</div>
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
                <el-button type="primary" @click="$router.push('/enterprise/positions')">
                  岗位管理
                </el-button>
                <el-button @click="$router.push('/enterprise/students')">
                  实习学生
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
import { Position, User, Edit, Bell } from '@element-plus/icons-vue';
import { getPositions } from '@/api/position';
import { getInternships } from '@/api/internship';
import { getNotifications } from '@/api/notification';

const loading = ref(false);
const stats = ref({
  totalPositions: 0,
  internshipStudents: 0,
  pendingEvaluations: 0,
  unreadNotifications: 0
});

const fetchStats = async () => {
  loading.value = true;
  try {
    // Fetch all data in parallel
    const [positionsRes, internshipsRes, notificationsRes] = await Promise.all([
      getPositions().catch(() => ({ success: false, data: { pagination: { total: 0 } } })),
      getInternships().catch(() => ({ success: false, data: { total: 0 } })),
      getNotifications({ is_read: false }).catch(() => ({ success: false, data: { total: 0 } }))
    ]);

    // Update stats
    stats.value.totalPositions = positionsRes.data?.pagination?.total || 0;
    
    // Count internship students
    const internships = internshipsRes.data?.internships || [];
    const uniqueStudents = new Set(internships.map(i => i.student_id));
    stats.value.internshipStudents = uniqueStudents.size;
    
    // Count pending evaluations (internships that need enterprise evaluation)
    stats.value.pendingEvaluations = internships.filter(i => 
      i.status === 'pending_evaluation' && i.enterprise_score === null
    ).length;
    
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

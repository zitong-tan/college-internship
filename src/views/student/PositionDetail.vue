<template>
  <Layout>
    <div class="page-container">
      <el-page-header @back="goBack" title="返回">
        <template #content>
          <span class="page-title">岗位详情</span>
        </template>
      </el-page-header>

      <div v-loading="loading" class="detail-content">
        <el-empty v-if="!loading && !position" description="岗位不存在" />
        
        <template v-if="position">
          <!-- Position Header -->
          <el-card class="header-card" shadow="never">
            <div class="position-header">
              <div class="title-section">
                <h1 class="position-title">{{ position.title }}</h1>
                <el-tag
                  :type="getStatusType(position.status)"
                  size="large"
                >
                  {{ getStatusText(position.status) }}
                </el-tag>
              </div>
              
              <div class="company-info">
                <el-icon class="company-icon"><OfficeBuilding /></el-icon>
                <span class="company-name">{{ position.enterprise?.company_name || '未知企业' }}</span>
              </div>
              
              <div class="quick-info">
                <div class="info-item">
                  <el-icon><Calendar /></el-icon>
                  <span>实习期限: {{ formatDate(position.start_date) }} 至 {{ formatDate(position.end_date) }}</span>
                </div>
                <div class="info-item">
                  <el-icon><User /></el-icon>
                  <span>招聘名额: {{ position.available_slots }}/{{ position.total_slots }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Clock /></el-icon>
                  <span>发布时间: {{ formatDateTime(position.created_at) }}</span>
                </div>
              </div>
            </div>
          </el-card>

          <!-- Position Details -->
          <el-card class="detail-card" shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon><Document /></el-icon>
                <span>岗位描述</span>
              </div>
            </template>
            <div class="description-content">
              {{ position.description }}
            </div>
          </el-card>

          <el-card v-if="position.requirements" class="detail-card" shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon><List /></el-icon>
                <span>岗位要求</span>
              </div>
            </template>
            <div class="requirements-content">
              {{ position.requirements }}
            </div>
          </el-card>

          <!-- Apply Button -->
          <div class="action-section">
            <el-button
              type="primary"
              size="large"
              :disabled="!canApply"
              :loading="applying"
              @click="showApplyDialog = true"
            >
              <el-icon><Edit /></el-icon>
              {{ getApplyButtonText() }}
            </el-button>
            <el-alert
              v-if="!canApply && position.status === 'open'"
              type="warning"
              :closable="false"
              show-icon
            >
              {{ getApplyDisabledReason() }}
            </el-alert>
          </div>
        </template>
      </div>

      <!-- Apply Dialog -->
      <el-dialog
        v-model="showApplyDialog"
        title="申请实习岗位"
        width="600px"
        :close-on-click-modal="false"
      >
        <el-form
          ref="applyFormRef"
          :model="applyForm"
          :rules="applyRules"
          label-width="100px"
        >
          <el-form-item label="个人简介" prop="personal_statement">
            <el-input
              v-model="applyForm.personal_statement"
              type="textarea"
              :rows="6"
              placeholder="请介绍您的教育背景、技能特长、实习经历等"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="联系方式" prop="contact_info">
            <el-input
              v-model="applyForm.contact_info"
              placeholder="请输入您的手机号或邮箱"
              maxlength="100"
            />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <el-button @click="showApplyDialog = false">取消</el-button>
          <el-button type="primary" :loading="applying" @click="handleApply">
            提交申请
          </el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  OfficeBuilding,
  Calendar,
  User,
  Clock,
  Document,
  List,
  Edit
} from '@element-plus/icons-vue';
import Layout from '@/components/common/Layout.vue';
import { getPosition } from '@/api/position';
import { submitApplication } from '@/api/application';
import { useStore } from 'vuex';

const route = useRoute();
const router = useRouter();
const _store = useStore();

// State
const loading = ref(false);
const applying = ref(false);
const position = ref(null);
const showApplyDialog = ref(false);
const applyFormRef = ref(null);

const applyForm = reactive({
  personal_statement: '',
  contact_info: ''
});

const applyRules = {
  personal_statement: [
    { required: true, message: '请输入个人简介', trigger: 'blur' },
    { min: 10, message: '个人简介至少10个字符', trigger: 'blur' }
  ],
  contact_info: [
    { required: true, message: '请输入联系方式', trigger: 'blur' }
  ]
};

// Computed
const canApply = computed(() => {
  if (!position.value) return false;
  if (position.value.status !== 'open') return false;
  if (position.value.available_slots === 0) return false;
  return true;
});

// Methods
const fetchPosition = async () => {
  loading.value = true;
  try {
    const response = await getPosition(route.params.id);
    if (response.success) {
      position.value = response.data;
      
      // Auto-open apply dialog if query param is set
      if (route.query.apply === 'true' && canApply.value) {
        showApplyDialog.value = true;
      }
    }
  } catch (error) {
    console.error('Failed to fetch position:', error);
    ElMessage.error('获取岗位详情失败');
  } finally {
    loading.value = false;
  }
};

const handleApply = async () => {
  if (!applyFormRef.value) return;
  
  await applyFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    applying.value = true;
    try {
      const response = await submitApplication({
        position_id: position.value.id,
        ...applyForm
      });
      
      if (response.success) {
        ElMessage.success('申请提交成功！');
        showApplyDialog.value = false;
        
        // Redirect to applications list
        setTimeout(() => {
          router.push('/student/applications');
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to submit application:', error);
      const message = error.response?.data?.error?.message || '申请提交失败';
      ElMessage.error(message);
    } finally {
      applying.value = false;
    }
  });
};

const goBack = () => {
  router.back();
};

const getStatusType = (status) => {
  const types = {
    open: 'success',
    full: 'warning',
    closed: 'info'
  };
  return types[status] || 'info';
};

const getStatusText = (status) => {
  const texts = {
    open: '开放中',
    full: '已满',
    closed: '已关闭'
  };
  return texts[status] || status;
};

const getApplyButtonText = () => {
  if (!position.value) return '申请岗位';
  if (position.value.status === 'full') return '名额已满';
  if (position.value.status === 'closed') return '已关闭';
  if (position.value.available_slots === 0) return '名额已满';
  return '申请岗位';
};

const getApplyDisabledReason = () => {
  if (!position.value) return '';
  if (position.value.available_slots === 0) return '该岗位名额已满';
  return '';
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
  fetchPosition();
});
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 1200px;
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

.position-header {
  padding: 8px 0;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.position-title {
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

.detail-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.description-content,
.requirements-content {
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
  padding: 24px;
  background: #F5F7FA;
  border-radius: 4px;
}

.action-section .el-button {
  width: 200px;
}
</style>

<template>
  <Layout>
    <div class="profile-container">
      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span>个人信息</span>
          </div>
        </template>

        <div v-loading="loading" class="profile-content">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户名">
              {{ profile.username }}
            </el-descriptions-item>
            <el-descriptions-item label="真实姓名">
              {{ profile.real_name }}
            </el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag :type="getRoleType(profile.role)">
                {{ getRoleText(profile.role) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ profile.email }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ profile.phone || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">
              {{ formatDate(profile.created_at) }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- Role-specific information -->
          <div v-if="profile.roleData" class="role-info">
            <el-divider content-position="left">
              <span class="divider-text">{{ getRoleText(profile.role) }}信息</span>
            </el-divider>

            <!-- Student Info -->
            <el-descriptions v-if="profile.role === 'student'" :column="2" border>
              <el-descriptions-item label="学号">
                {{ profile.roleData.student_number }}
              </el-descriptions-item>
              <el-descriptions-item label="专业">
                {{ profile.roleData.major }}
              </el-descriptions-item>
              <el-descriptions-item label="年级">
                {{ profile.roleData.grade }}
              </el-descriptions-item>
              <el-descriptions-item label="班级">
                {{ profile.roleData.class_name || '未设置' }}
              </el-descriptions-item>
            </el-descriptions>

            <!-- Teacher Info -->
            <el-descriptions v-if="profile.role === 'teacher'" :column="2" border>
              <el-descriptions-item label="工号">
                {{ profile.roleData.teacher_number }}
              </el-descriptions-item>
              <el-descriptions-item label="部门">
                {{ profile.roleData.department }}
              </el-descriptions-item>
              <el-descriptions-item label="职称" :span="2">
                {{ profile.roleData.title || '未设置' }}
              </el-descriptions-item>
            </el-descriptions>

            <!-- Enterprise Info -->
            <el-descriptions v-if="profile.role === 'enterprise'" :column="2" border>
              <el-descriptions-item label="企业名称" :span="2">
                {{ profile.roleData.company_name }}
              </el-descriptions-item>
              <el-descriptions-item label="行业">
                {{ profile.roleData.industry || '未设置' }}
              </el-descriptions-item>
              <el-descriptions-item label="网站">
                <a v-if="profile.roleData.website" :href="profile.roleData.website" target="_blank">
                  {{ profile.roleData.website }}
                </a>
                <span v-else>未设置</span>
              </el-descriptions-item>
              <el-descriptions-item label="地址" :span="2">
                {{ profile.roleData.address || '未设置' }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- Action buttons -->
          <div class="action-buttons">
            <el-button type="primary" @click="showPasswordDialog = true">
              修改密码
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- Change Password Dialog -->
      <el-dialog
        v-model="showPasswordDialog"
        title="修改密码"
        width="500px"
        :close-on-click-modal="false"
      >
        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="100px"
        >
          <el-form-item label="当前密码" prop="currentPassword">
            <el-input
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="请输入当前密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码（至少6位）"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handlePasswordChange">
            确认修改
          </el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import Layout from '@/components/common/Layout.vue';
import { getProfile, updatePassword } from '@/api/user';

const loading = ref(false);
const submitting = ref(false);
const showPasswordDialog = ref(false);
const passwordFormRef = ref(null);

const profile = ref({
  username: '',
  real_name: '',
  role: '',
  email: '',
  phone: '',
  created_at: '',
  roleData: null
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

const fetchProfile = async () => {
  loading.value = true;
  try {
    const response = await getProfile();
    if (response.success) {
      profile.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    ElMessage.error('获取个人信息失败');
  } finally {
    loading.value = false;
  }
};

const handlePasswordChange = async () => {
  try {
    await passwordFormRef.value.validate();
    submitting.value = true;

    await updatePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });

    ElMessage.success('密码修改成功，请重新登录');
    showPasswordDialog.value = false;
    
    // Reset form
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }, 2000);
  } catch (error) {
    if (error !== false) {
      console.error('Failed to update password:', error);
      ElMessage.error(error.response?.data?.error?.message || '密码修改失败');
    }
  } finally {
    submitting.value = false;
  }
};

const getRoleType = (role) => {
  const types = {
    student: 'primary',
    teacher: 'success',
    enterprise: 'warning'
  };
  return types[role] || 'info';
};

const getRoleText = (role) => {
  const texts = {
    student: '学生',
    teacher: '教师',
    enterprise: '企业'
  };
  return texts[role] || role;
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

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.profile-container {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.profile-card {
  margin-bottom: 24px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
}

.profile-content {
  min-height: 300px;
}

.role-info {
  margin-top: 24px;
}

.divider-text {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.action-buttons {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>

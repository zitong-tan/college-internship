<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>高校实习管理系统</h1>
        <p class="subtitle">University Internship Management System</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名 / Username"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码 / Password"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="role">
          <el-select
            v-model="loginForm.role"
            placeholder="选择角色 / Select Role"
            size="large"
            style="width: 100%"
          >
            <el-option label="学生 / Student" value="student" />
            <el-option label="教师 / Teacher" value="teacher" />
            <el-option label="企业 / Enterprise" value="enterprise" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            style="width: 100%"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录 / Login' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div v-if="errorMessage" class="error-message">
        <el-alert
          :title="errorMessage"
          type="error"
          :closable="true"
          @close="errorMessage = ''"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const store = useStore();

// Form data
const loginForm = reactive({
  username: '',
  password: '',
  role: 'student'
});

// Form validation rules
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度应在 3-50 个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
};

// Form reference
const loginFormRef = ref(null);

// Loading state
const loading = ref(false);

// Error message
const errorMessage = ref('');

// Handle login
const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    // Validate form
    await loginFormRef.value.validate();

    // Clear previous error
    errorMessage.value = '';
    loading.value = true;

    // Call login action
    const result = await store.dispatch('auth/login', {
      username: loginForm.username,
      password: loginForm.password,
      role: loginForm.role
    });

    if (result.success) {
      ElMessage.success('登录成功！');

      // Redirect to appropriate dashboard based on role
      const dashboardMap = {
        student: '/student',
        teacher: '/teacher',
        enterprise: '/enterprise'
      };

      const redirectPath = route.query.redirect || dashboardMap[result.user.role] || '/';
      
      // Use replace to prevent going back to login page
      router.replace(redirectPath);
    } else {
      errorMessage.value = result.message || '登录失败，请检查您的凭据';
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        errorMessage.value = '用户名或密码错误';
      } else if (status === 400) {
        errorMessage.value = data.error?.message || '请求参数错误';
      } else if (status === 500) {
        errorMessage.value = '服务器错误，请稍后重试';
      } else {
        errorMessage.value = data.error?.message || '登录失败，请重试';
      }
    } else if (error.message === 'Network Error') {
      errorMessage.value = '网络错误，请检查您的网络连接';
    } else {
      errorMessage.value = error.message || '登录失败，请重试';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  color: #303133;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.login-header .subtitle {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.login-form {
  margin-top: 30px;
}

.error-message {
  margin-top: 20px;
}

/* Responsive design */
@media (max-width: 768px) {
  .login-card {
    padding: 30px 20px;
  }

  .login-header h1 {
    font-size: 24px;
  }
}
</style>

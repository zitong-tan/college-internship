<template>
  <div class="app-header">
    <div class="header-container">
      <!-- Logo and Title -->
      <div class="header-left">
        <router-link to="/" class="logo-link">
          <h2 class="app-title">高校实习管理系统</h2>
        </router-link>
      </div>

      <!-- User Info and Actions -->
      <div class="header-right">
        <!-- Notifications -->
        <NotificationPopover v-if="isAuthenticated" />

        <!-- User Dropdown -->
        <el-dropdown v-if="isAuthenticated" trigger="click" @command="handleCommand">
          <div class="user-info">
            <el-avatar :size="36" :icon="UserFilled" />
            <span class="user-name">{{ userName }}</span>
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>
                <div class="user-role">
                  <el-tag :type="roleTagType" size="small">
                    {{ roleLabel }}
                  </el-tag>
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided command="profile">
                <el-icon><User /></el-icon>
                个人信息
              </el-dropdown-item>
              <el-dropdown-item command="password">
                <el-icon><Lock /></el-icon>
                修改密码
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- Login Button (when not authenticated) -->
        <el-button
          v-else
          type="primary"
          @click="goToLogin"
        >
          登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import NotificationPopover from './NotificationPopover.vue';
import {
  UserFilled,
  ArrowDown,
  User,
  Lock,
  SwitchButton
} from '@element-plus/icons-vue';

const router = useRouter();
const store = useStore();

// Computed properties
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
const userName = computed(() => store.getters['auth/userName']);
const userRole = computed(() => store.getters['auth/userRole']);

// Role label mapping
const roleLabel = computed(() => {
  const roleMap = {
    student: '学生',
    teacher: '教师',
    enterprise: '企业'
  };
  return roleMap[userRole.value] || '用户';
});

// Role tag type mapping
const roleTagType = computed(() => {
  const typeMap = {
    student: 'primary',
    teacher: 'success',
    enterprise: 'warning'
  };
  return typeMap[userRole.value] || 'info';
});

// Navigate to login
const goToLogin = () => {
  router.push('/login');
};

// Handle dropdown menu commands
const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      handleProfile();
      break;
    case 'password':
      handlePassword();
      break;
    case 'logout':
      await handleLogout();
      break;
  }
};

// Handle profile view
const handleProfile = () => {
  router.push('/profile');
};

// Handle password change
const handlePassword = () => {
  router.push('/profile');
  // The profile page will handle password change
};

// Handle logout
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '退出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    // Perform logout
    await store.dispatch('auth/logout');
    
    ElMessage.success('已退出登录');
    
    // Redirect to login page
    router.push('/login');
  } catch (error) {
    // User cancelled or error occurred
    if (error !== 'cancel') {
      console.error('Logout error:', error);
      ElMessage.error('退出登录失败');
    }
  }
};
</script>

<style scoped>
.app-header {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  cursor: pointer;
  transition: color 0.3s;
}

.app-title:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  padding: 4px 0;
  text-align: center;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }

  .app-title {
    font-size: 16px;
  }

  .user-name {
    display: none;
  }

  .header-right {
    gap: 8px;
  }
}
</style>

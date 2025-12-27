<template>
  <el-popover
    :visible="visible"
    placement="bottom-end"
    :width="400"
    trigger="click"
    popper-class="notification-popover"
    @show="handleShow"
    @hide="handleHide"
  >
    <template #reference>
      <el-badge
        :value="unreadCount"
        :hidden="unreadCount === 0"
        :max="99"
        class="notification-badge"
      >
        <el-button
          :icon="Bell"
          circle
          @click="togglePopover"
        />
      </el-badge>
    </template>

    <div class="notification-popover-content">
      <!-- Header -->
      <div class="popover-header">
        <h3>通知</h3>
        <div class="header-actions">
          <el-button
            v-if="unreadCount > 0"
            link
            size="small"
            @click="handleMarkAllAsRead"
          >
            全部已读
          </el-button>
          <el-button
            link
            size="small"
            @click="goToNotificationCenter"
          >
            查看全部
          </el-button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="popover-loading">
        <el-skeleton :rows="3" animated />
      </div>

      <!-- Notification List -->
      <div v-else-if="recentNotifications.length > 0" class="popover-list">
        <div
          v-for="notification in recentNotifications"
          :key="notification.id"
          class="popover-item"
          :class="{ 'unread': !notification.is_read }"
          @click="handleNotificationClick(notification)"
        >
          <div class="item-icon">
            <el-icon :size="20" :color="getNotificationIconColor(notification.type)">
              <component :is="getNotificationIcon(notification.type)" />
            </el-icon>
          </div>
          
          <div class="item-content">
            <div class="item-title">
              {{ notification.title }}
              <el-badge
                v-if="!notification.is_read"
                is-dot
                type="danger"
              />
            </div>
            <div class="item-text">{{ truncateText(notification.content, 50) }}</div>
            <div class="item-time">{{ formatTime(notification.created_at) }}</div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="popover-empty">
        <el-icon :size="48" color="#c0c4cc">
          <Bell />
        </el-icon>
        <p>暂无通知</p>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import {
  Bell,
  InfoFilled,
  WarningFilled,
  SuccessFilled,
  CircleCheck,
  Document,
  User
} from '@element-plus/icons-vue';

const router = useRouter();
const store = useStore();

// State
const visible = ref(false);
let refreshInterval = null;

// Computed
const loading = computed(() => store.state.notification.loading);
const notifications = computed(() => store.state.notification.notifications);
const unreadCount = computed(() => store.state.notification.unreadCount);

// Get recent notifications (max 5)
const recentNotifications = computed(() => {
  return notifications.value.slice(0, 5);
});

// Methods
const togglePopover = () => {
  visible.value = !visible.value;
};

const handleShow = async () => {
  // Fetch latest notifications when popover opens
  await fetchNotifications();
};

const handleHide = () => {
  visible.value = false;
};

const fetchNotifications = async () => {
  try {
    await store.dispatch('notification/fetchNotifications', {
      limit: 10,
      offset: 0
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
};

const fetchUnreadCount = async () => {
  try {
    await store.dispatch('notification/fetchUnreadCount');
  } catch (error) {
    console.error('Failed to fetch unread count:', error);
  }
};

const handleNotificationClick = async (notification) => {
  // Mark as read
  if (!notification.is_read) {
    try {
      await store.dispatch('notification/markAsRead', notification.id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  // Close popover
  visible.value = false;

  // Navigate to notification center
  router.push('/notifications');
};

const handleMarkAllAsRead = async () => {
  try {
    await store.dispatch('notification/markAllAsRead');
    ElMessage.success('已全部标记为已读');
    await fetchNotifications();
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    ElMessage.error('操作失败');
  }
};

const goToNotificationCenter = () => {
  visible.value = false;
  router.push('/notifications');
};

const getNotificationIcon = (type) => {
  const iconMap = {
    'info': InfoFilled,
    'warning': WarningFilled,
    'success': SuccessFilled,
    'application': Document,
    'evaluation': CircleCheck,
    'reminder': Bell,
    'system': User
  };
  return iconMap[type] || InfoFilled;
};

const getNotificationIconColor = (type) => {
  const colorMap = {
    'info': '#409eff',
    'warning': '#e6a23c',
    'success': '#67c23a',
    'application': '#409eff',
    'evaluation': '#67c23a',
    'reminder': '#e6a23c',
    'system': '#909399'
  };
  return colorMap[type] || '#409eff';
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) {
    return '刚刚';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
  }
  
  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }
  
  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}天前`;
  }
  
  // Format as date
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Lifecycle
onMounted(() => {
  // Initial fetch
  fetchUnreadCount();

  // Set up polling for unread count (every 30 seconds)
  refreshInterval = setInterval(() => {
    fetchUnreadCount();
  }, 30000);
});

onUnmounted(() => {
  // Clear interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.notification-badge {
  cursor: pointer;
}

.notification-popover-content {
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.popover-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.popover-loading {
  padding: 16px;
}

.popover-list {
  max-height: 400px;
  overflow-y: auto;
}

.popover-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-bottom: 1px solid #f5f7fa;
}

.popover-item:last-child {
  border-bottom: none;
}

.popover-item:hover {
  background-color: #f5f7fa;
}

.popover-item.unread {
  background-color: #f0f9ff;
}

.item-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f7fa;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-text {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-time {
  font-size: 12px;
  color: #909399;
}

.popover-empty {
  text-align: center;
  padding: 40px 20px;
}

.popover-empty p {
  margin: 12px 0 0;
  font-size: 14px;
  color: #909399;
}

/* Custom scrollbar */
.popover-list::-webkit-scrollbar {
  width: 6px;
}

.popover-list::-webkit-scrollbar-track {
  background: #f5f7fa;
}

.popover-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.popover-list::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}
</style>

<style>
/* Global styles for popover */
.notification-popover {
  padding: 0 !important;
}

.notification-popover .el-popover__title {
  display: none;
}
</style>

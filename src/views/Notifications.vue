<template>
  <Layout>
    <div class="notifications-page">
      <div class="page-header">
        <div class="header-left">
          <h1>通知中心</h1>
          <p>Notification Center</p>
        </div>
        <div class="header-actions">
          <el-button
            v-if="unreadCount > 0"
            type="primary"
            :icon="Check"
            @click="handleMarkAllAsRead"
            :loading="markingAllAsRead"
          >
            全部标记为已读
          </el-button>
        </div>
      </div>

      <el-card>
        <!-- Filter Tabs -->
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="全部通知" name="all">
            <template #label>
              <span>全部通知 ({{ totalCount }})</span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="未读" name="unread">
            <template #label>
              <el-badge :value="unreadCount" :hidden="unreadCount === 0">
                <span>未读</span>
              </el-badge>
            </template>
          </el-tab-pane>
          <el-tab-pane label="已读" name="read">
            <template #label>
              <span>已读 ({{ readCount }})</span>
            </template>
          </el-tab-pane>
        </el-tabs>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="5" animated />
        </div>

        <!-- Notification List -->
        <div v-else-if="displayedNotifications.length > 0" class="notification-list">
          <div
            v-for="notification in displayedNotifications"
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.is_read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon">
              <el-icon :size="24" :color="getNotificationIconColor(notification.type)">
                <component :is="getNotificationIcon(notification.type)" />
              </el-icon>
            </div>
            
            <div class="notification-content">
              <div class="notification-header">
                <h4 class="notification-title">{{ notification.title }}</h4>
                <el-tag
                  v-if="!notification.is_read"
                  type="danger"
                  size="small"
                  effect="dark"
                >
                  未读
                </el-tag>
              </div>
              
              <p class="notification-text">{{ notification.content }}</p>
              
              <div class="notification-footer">
                <span class="notification-time">
                  <el-icon><Clock /></el-icon>
                  {{ formatTime(notification.created_at) }}
                </span>
                <span v-if="notification.type" class="notification-type">
                  {{ getNotificationTypeLabel(notification.type) }}
                </span>
              </div>
            </div>

            <div class="notification-actions">
              <el-button
                v-if="!notification.is_read"
                type="primary"
                size="small"
                :icon="Check"
                circle
                @click.stop="handleMarkAsRead(notification.id)"
                title="标记为已读"
              />
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                circle
                @click.stop="handleDelete(notification.id)"
                title="删除"
              />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <el-icon :size="80" color="#909399">
            <Bell />
          </el-icon>
          <p class="empty-text">{{ getEmptyText() }}</p>
          <p class="empty-subtext">{{ getEmptySubtext() }}</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalCount > pageSize" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalCount"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import Layout from '@/components/common/Layout.vue';
import {
  Bell,
  Check,
  Delete,
  Clock,
  InfoFilled,
  WarningFilled,
  SuccessFilled,
  CircleCheck,
  Document,
  User
} from '@element-plus/icons-vue';

const store = useStore();

// State
const activeTab = ref('all');
const currentPage = ref(1);
const pageSize = ref(20);
const markingAllAsRead = ref(false);

// Computed
const loading = computed(() => store.state.notification.loading);
const notifications = computed(() => store.state.notification.notifications);
const unreadCount = computed(() => store.state.notification.unreadCount);

const displayedNotifications = computed(() => {
  if (activeTab.value === 'unread') {
    return notifications.value.filter(n => !n.is_read);
  } else if (activeTab.value === 'read') {
    return notifications.value.filter(n => n.is_read);
  }
  return notifications.value;
});

const totalCount = computed(() => displayedNotifications.value.length);
const readCount = computed(() => notifications.value.filter(n => n.is_read).length);

// Methods
const fetchNotifications = async () => {
  try {
    const params = {
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    };

    if (activeTab.value === 'unread') {
      params.is_read = false;
    } else if (activeTab.value === 'read') {
      params.is_read = true;
    }

    await store.dispatch('notification/fetchNotifications', params);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    ElMessage.error('获取通知列表失败');
  }
};

const handleTabChange = () => {
  currentPage.value = 1;
  fetchNotifications();
};

const handlePageChange = () => {
  fetchNotifications();
};

const handleSizeChange = () => {
  currentPage.value = 1;
  fetchNotifications();
};

const handleNotificationClick = async (notification) => {
  // Mark as read when clicked
  if (!notification.is_read) {
    await handleMarkAsRead(notification.id);
  }
};

const handleMarkAsRead = async (notificationId) => {
  try {
    await store.dispatch('notification/markAsRead', notificationId);
    ElMessage.success('已标记为已读');
  } catch (error) {
    console.error('Failed to mark as read:', error);
    ElMessage.error('标记失败');
  }
};

const handleMarkAllAsRead = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要将所有 ${unreadCount.value} 条未读通知标记为已读吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    markingAllAsRead.value = true;
    await store.dispatch('notification/markAllAsRead');
    ElMessage.success('已全部标记为已读');
    
    // Refresh list
    await fetchNotifications();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to mark all as read:', error);
      ElMessage.error('操作失败');
    }
  } finally {
    markingAllAsRead.value = false;
  }
};

const handleDelete = async (notificationId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条通知吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await store.dispatch('notification/deleteNotification', notificationId);
    ElMessage.success('删除成功');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete notification:', error);
      ElMessage.error('删除失败');
    }
  }
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

const getNotificationTypeLabel = (type) => {
  const labelMap = {
    'info': '信息',
    'warning': '警告',
    'success': '成功',
    'application': '申请',
    'evaluation': '评价',
    'reminder': '提醒',
    'system': '系统'
  };
  return labelMap[type] || '通知';
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
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getEmptyText = () => {
  if (activeTab.value === 'unread') {
    return '暂无未读通知';
  } else if (activeTab.value === 'read') {
    return '暂无已读通知';
  }
  return '暂无通知';
};

const getEmptySubtext = () => {
  if (activeTab.value === 'unread') {
    return 'No unread notifications';
  } else if (activeTab.value === 'read') {
    return 'No read notifications';
  }
  return 'No notifications yet';
};

// Lifecycle
onMounted(() => {
  fetchNotifications();
});
</script>

<style scoped>
.notifications-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 8px 0;
}

.header-left p {
  color: #909399;
  margin: 0;
}

.loading-state {
  padding: 20px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  background: #ffffff;
  transition: all 0.3s;
  cursor: pointer;
}

.notification-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.notification-item.unread {
  background: #f0f9ff;
  border-color: #b3d8ff;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f7fa;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  flex: 1;
}

.notification-text {
  font-size: 14px;
  color: #606266;
  margin: 0 0 12px 0;
  line-height: 1.6;
  word-break: break-word;
}

.notification-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.notification-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.notification-type {
  padding: 2px 8px;
  border-radius: 4px;
  background: #f5f7fa;
}

.notification-actions {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-text {
  font-size: 18px;
  color: #606266;
  margin: 20px 0 8px;
}

.empty-subtext {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

/* Responsive design */
@media (max-width: 768px) {
  .notifications-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .notification-item {
    flex-direction: column;
    gap: 12px;
  }

  .notification-actions {
    opacity: 1;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

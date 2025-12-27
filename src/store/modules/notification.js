import request from '@/utils/request';

const state = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0
  }
};

const getters = {
  notifications: state => state.notifications,
  unreadCount: state => state.unreadCount,
  loading: state => state.loading,
  pagination: state => state.pagination,
  unreadNotifications: state => state.notifications.filter(n => !n.is_read),
  readNotifications: state => state.notifications.filter(n => n.is_read)
};

const mutations = {
  SET_NOTIFICATIONS(state, notifications) {
    state.notifications = notifications;
  },
  
  SET_UNREAD_COUNT(state, count) {
    state.unreadCount = count;
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination };
  },
  
  ADD_NOTIFICATION(state, notification) {
    state.notifications.unshift(notification);
    if (!notification.is_read) {
      state.unreadCount++;
    }
  },
  
  MARK_AS_READ(state, notificationId) {
    const notification = state.notifications.find(n => n.id === notificationId);
    if (notification && !notification.is_read) {
      notification.is_read = true;
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    }
  },
  
  MARK_ALL_AS_READ(state) {
    state.notifications.forEach(n => {
      n.is_read = true;
    });
    state.unreadCount = 0;
  },
  
  REMOVE_NOTIFICATION(state, notificationId) {
    const notification = state.notifications.find(n => n.id === notificationId);
    if (notification && !notification.is_read) {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    }
    state.notifications = state.notifications.filter(n => n.id !== notificationId);
  },
  
  CLEAR_NOTIFICATIONS(state) {
    state.notifications = [];
    state.unreadCount = 0;
  }
};

const actions = {
  // Fetch notifications list
  async fetchNotifications({ commit, state }, params = {}) {
    commit('SET_LOADING', true);
    try {
      const queryParams = {
        page: params.page || state.pagination.page,
        pageSize: params.pageSize || state.pagination.pageSize,
        ...params
      };
      
      const response = await request.get('/notifications', { params: queryParams });
      
      if (response.success && response.data) {
        const notifications = response.data.notifications || response.data;
        commit('SET_NOTIFICATIONS', notifications);
        
        // Calculate unread count
        const unreadCount = notifications.filter(n => !n.is_read).length;
        commit('SET_UNREAD_COUNT', unreadCount);
        
        if (response.data.pagination) {
          commit('SET_PAGINATION', response.data.pagination);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Fetch notifications error:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Fetch unread count only
  async fetchUnreadCount({ commit }) {
    try {
      const response = await request.get('/notifications', { 
        params: { unreadOnly: true, pageSize: 1 } 
      });
      
      if (response.success && response.data) {
        const count = response.data.total || response.data.unreadCount || 0;
        commit('SET_UNREAD_COUNT', count);
      }
      
      return response;
    } catch (error) {
      console.error('Fetch unread count error:', error);
      throw error;
    }
  },
  
  // Mark notification as read
  async markAsRead({ commit }, notificationId) {
    try {
      const response = await request.put(`/notifications/${notificationId}/read`);
      
      if (response.success) {
        commit('MARK_AS_READ', notificationId);
      }
      
      return response;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  },
  
  // Mark all notifications as read
  async markAllAsRead({ commit }) {
    try {
      const response = await request.put('/notifications/read-all');
      
      if (response.success) {
        commit('MARK_ALL_AS_READ');
      }
      
      return response;
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  },
  
  // Delete notification
  async deleteNotification({ commit }, notificationId) {
    try {
      const response = await request.delete(`/notifications/${notificationId}`);
      
      if (response.success) {
        commit('REMOVE_NOTIFICATION', notificationId);
      }
      
      return response;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  },
  
  // Add notification (for real-time updates)
  addNotification({ commit }, notification) {
    commit('ADD_NOTIFICATION', notification);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};

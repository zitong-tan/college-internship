import request from '@/utils/request';

const state = {
  user: null,
  token: null,
  isAuthenticated: false
};

const getters = {
  user: state => state.user,
  token: state => state.token,
  isAuthenticated: state => state.isAuthenticated,
  userRole: state => state.user?.role || null,
  userId: state => state.user?.id || null,
  userName: state => state.user?.real_name || state.user?.username || null
};

const mutations = {
  SET_USER(state, user) {
    state.user = user;
    state.isAuthenticated = !!user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },
  
  SET_TOKEN(state, token) {
    state.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },
  
  CLEAR_AUTH(state) {
    state.user = null;
    state.token = null;
    state.isAuthenticated = false;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};

const actions = {
  // Login action
  async login({ commit }, credentials) {
    try {
      const response = await request.post('/auth/login', credentials);
      
      if (response.success && response.data) {
        // 后端返回的数据结构: { id, username, role, email, phone, real_name, token }
        const userData = response.data;
        const token = userData.token;
        
        // 从userData中移除token，剩余的作为user对象
        const { token: _, ...user } = userData;
        
        commit('SET_TOKEN', token);
        commit('SET_USER', user);
        
        return { success: true, user };
      }
      
      return { success: false, message: '登录失败' };
    } catch (error) {
      commit('CLEAR_AUTH');
      throw error;
    }
  },
  
  // Logout action
  async logout({ commit }) {
    try {
      await request.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      commit('CLEAR_AUTH');
    }
  },
  
  // Get current user profile
  async fetchProfile({ commit }) {
    try {
      const response = await request.get('/auth/profile');
      
      if (response.success && response.data) {
        commit('SET_USER', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      commit('CLEAR_AUTH');
      throw error;
    }
  },
  
  // Update password
  async updatePassword(context, passwordData) {
    const response = await request.put('/auth/password', passwordData);
    return response;
  },
  
  // Initialize auth state from localStorage
  initAuth({ commit }) {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        commit('SET_TOKEN', token);
        commit('SET_USER', user);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        commit('CLEAR_AUTH');
      }
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};

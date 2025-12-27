import request from '@/utils/request';

const state = {
  applications: [],
  currentApplication: null,
  loading: false,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0
  },
  filters: {
    status: null,
    studentId: null,
    positionId: null
  }
};

const getters = {
  applications: state => state.applications,
  currentApplication: state => state.currentApplication,
  loading: state => state.loading,
  pagination: state => state.pagination,
  filters: state => state.filters,
  pendingApplications: state => state.applications.filter(a => a.status === 'pending'),
  approvedApplications: state => state.applications.filter(a => a.status === 'approved'),
  rejectedApplications: state => state.applications.filter(a => a.status === 'rejected')
};

const mutations = {
  SET_APPLICATIONS(state, applications) {
    state.applications = applications;
  },
  
  SET_CURRENT_APPLICATION(state, application) {
    state.currentApplication = application;
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination };
  },
  
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters };
  },
  
  ADD_APPLICATION(state, application) {
    state.applications.unshift(application);
  },
  
  UPDATE_APPLICATION(state, updatedApplication) {
    const index = state.applications.findIndex(a => a.id === updatedApplication.id);
    if (index !== -1) {
      state.applications.splice(index, 1, updatedApplication);
    }
    if (state.currentApplication?.id === updatedApplication.id) {
      state.currentApplication = updatedApplication;
    }
  },
  
  REMOVE_APPLICATION(state, applicationId) {
    state.applications = state.applications.filter(a => a.id !== applicationId);
    if (state.currentApplication?.id === applicationId) {
      state.currentApplication = null;
    }
  },
  
  CLEAR_APPLICATIONS(state) {
    state.applications = [];
    state.currentApplication = null;
  }
};

const actions = {
  // Fetch applications list
  async fetchApplications({ commit, state }, params = {}) {
    commit('SET_LOADING', true);
    try {
      const queryParams = {
        page: params.page || state.pagination.page,
        pageSize: params.pageSize || state.pagination.pageSize,
        ...state.filters,
        ...params
      };
      
      const response = await request.get('/applications', { params: queryParams });
      
      if (response.success && response.data) {
        commit('SET_APPLICATIONS', response.data.applications || response.data);
        
        if (response.data.pagination) {
          commit('SET_PAGINATION', response.data.pagination);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Fetch applications error:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Fetch single application by ID
  async fetchApplication({ commit }, applicationId) {
    commit('SET_LOADING', true);
    try {
      const response = await request.get(`/applications/${applicationId}`);
      
      if (response.success && response.data) {
        commit('SET_CURRENT_APPLICATION', response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Fetch application error:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Submit application (student only)
  async submitApplication({ commit }, applicationData) {
    try {
      const response = await request.post('/applications', applicationData);
      
      if (response.success && response.data) {
        commit('ADD_APPLICATION', response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Submit application error:', error);
      throw error;
    }
  },
  
  // Approve application (teacher only)
  async approveApplication({ commit }, applicationId) {
    try {
      const response = await request.put(`/applications/${applicationId}/approve`);
      
      if (response.success && response.data) {
        commit('UPDATE_APPLICATION', response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Approve application error:', error);
      throw error;
    }
  },
  
  // Reject application (teacher only)
  async rejectApplication({ commit }, { id, reason }) {
    try {
      const response = await request.put(`/applications/${id}/reject`, { 
        rejection_reason: reason 
      });
      
      if (response.success && response.data) {
        commit('UPDATE_APPLICATION', response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Reject application error:', error);
      throw error;
    }
  },
  
  // Update filters
  updateFilters({ commit }, filters) {
    commit('SET_FILTERS', filters);
  },
  
  // Clear filters
  clearFilters({ commit }) {
    commit('SET_FILTERS', {
      status: null,
      studentId: null,
      positionId: null
    });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};

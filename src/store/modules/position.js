import request from '@/utils/request';

const state = {
  positions: [],
  currentPosition: null,
  loading: false,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0
  },
  filters: {
    keyword: '',
    enterpriseId: null,
    status: null,
    startDate: null,
    endDate: null
  }
};

const getters = {
  positions: state => state.positions,
  currentPosition: state => state.currentPosition,
  loading: state => state.loading,
  pagination: state => state.pagination,
  filters: state => state.filters,
  availablePositions: state => state.positions.filter(p => p.status === 'open' && p.available_slots > 0)
};

const mutations = {
  SET_POSITIONS(state, positions) {
    state.positions = positions;
  },
  
  SET_CURRENT_POSITION(state, position) {
    state.currentPosition = position;
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
  
  ADD_POSITION(state, position) {
    state.positions.unshift(position);
  },
  
  UPDATE_POSITION(state, updatedPosition) {
    const index = state.positions.findIndex(p => p.id === updatedPosition.id);
    if (index !== -1) {
      state.positions.splice(index, 1, updatedPosition);
    }
    if (state.currentPosition?.id === updatedPosition.id) {
      state.currentPosition = updatedPosition;
    }
  },
  
  REMOVE_POSITION(state, positionId) {
    state.positions = state.positions.filter(p => p.id !== positionId);
    if (state.currentPosition?.id === positionId) {
      state.currentPosition = null;
    }
  },
  
  CLEAR_POSITIONS(state) {
    state.positions = [];
    state.currentPosition = null;
  }
};

const actions = {
  // Fetch positions list with filters
  async fetchPositions({ commit, state }, params = {}) {
    commit('SET_LOADING', true);
    try {
      const queryParams = {
        page: params.page || state.pagination.page,
        pageSize: params.pageSize || state.pagination.pageSize,
        ...state.filters,
        ...params
      };
      
      const response = await request.get('/positions', { params: queryParams });
      
      if (response.success && response.data) {
        commit('SET_POSITIONS', response.data.positions || response.data);
        
        if (response.data.pagination) {
          commit('SET_PAGINATION', response.data.pagination);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Fetch positions error:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Fetch single position by ID
  async fetchPosition({ commit }, positionId) {
    commit('SET_LOADING', true);
    try {
      const response = await request.get(`/positions/${positionId}`);
      
      if (response.success && response.data) {
        commit('SET_CURRENT_POSITION', response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Fetch position error:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Create new position (enterprise only)
  async createPosition({ commit }, positionData) {
    try {
      const response = await request.post('/positions', positionData);
      
      if (response.success && response.data) {
        commit('ADD_POSITION', response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Create position error:', error);
      throw error;
    }
  },
  
  // Update position (enterprise only)
  async updatePosition({ commit }, { id, data }) {
    try {
      const response = await request.put(`/positions/${id}`, data);
      
      if (response.success && response.data) {
        commit('UPDATE_POSITION', response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Update position error:', error);
      throw error;
    }
  },
  
  // Delete position (enterprise only)
  async deletePosition({ commit }, positionId) {
    try {
      const response = await request.delete(`/positions/${positionId}`);
      
      if (response.success) {
        commit('REMOVE_POSITION', positionId);
      }
      
      return response;
    } catch (error) {
      console.error('Delete position error:', error);
      throw error;
    }
  },
  
  // Update filters
  updateFilters({ commit }, filters) {
    commit('SET_FILTERS', filters);
    // Optionally auto-fetch with new filters
    // dispatch('fetchPositions');
  },
  
  // Clear filters
  clearFilters({ commit }) {
    commit('SET_FILTERS', {
      keyword: '',
      enterpriseId: null,
      status: null,
      startDate: null,
      endDate: null
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

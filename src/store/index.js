import { createStore } from 'vuex';

// Import modules
import auth from './modules/auth';
import position from './modules/position';
import application from './modules/application';
import notification from './modules/notification';

export default createStore({
  state: {
    // Global state
    appLoading: false,
    appError: null
  },
  getters: {
    // Global getters
    appLoading: state => state.appLoading,
    appError: state => state.appError
  },
  mutations: {
    // Global mutations
    SET_APP_LOADING(state, loading) {
      state.appLoading = loading;
    },
    SET_APP_ERROR(state, error) {
      state.appError = error;
    },
    CLEAR_APP_ERROR(state) {
      state.appError = null;
    }
  },
  actions: {
    // Global actions
    setAppLoading({ commit }, loading) {
      commit('SET_APP_LOADING', loading);
    },
    setAppError({ commit }, error) {
      commit('SET_APP_ERROR', error);
    },
    clearAppError({ commit }) {
      commit('CLEAR_APP_ERROR');
    }
  },
  modules: {
    // Register Vuex modules
    auth,
    position,
    application,
    notification
  }
});

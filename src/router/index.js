import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  // Student routes
  {
    path: '/student',
    name: 'StudentDashboard',
    component: () => import('../views/StudentDashboard.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/positions',
    name: 'StudentPositions',
    component: () => import('../views/student/PositionList.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/positions/:id',
    name: 'StudentPositionDetail',
    component: () => import('../views/student/PositionDetail.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/applications',
    name: 'StudentApplications',
    component: () => import('../views/student/ApplicationList.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/internships',
    name: 'StudentInternships',
    component: () => import('../views/student/InternshipList.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/internships/:id',
    name: 'StudentInternshipDetail',
    component: () => import('../views/student/InternshipDetail.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  // Teacher routes
  {
    path: '/teacher',
    name: 'TeacherDashboard',
    component: () => import('../views/TeacherDashboard.vue'),
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/applications',
    name: 'TeacherApplications',
    component: () => import('../views/teacher/ApplicationReview.vue'),
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/students',
    name: 'TeacherStudents',
    component: () => import('../views/teacher/StudentMonitor.vue'),
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/statistics',
    name: 'TeacherStatistics',
    component: () => import('../views/teacher/Statistics.vue'),
    meta: { requiresAuth: true, role: 'teacher' }
  },
  // Enterprise routes
  {
    path: '/enterprise',
    name: 'EnterpriseDashboard',
    component: () => import('../views/EnterpriseDashboard.vue'),
    meta: { requiresAuth: true, role: 'enterprise' }
  },
  {
    path: '/enterprise/positions',
    name: 'EnterprisePositions',
    component: () => import('../views/enterprise/PositionManagement.vue'),
    meta: { requiresAuth: true, role: 'enterprise' }
  },
  {
    path: '/enterprise/students',
    name: 'EnterpriseStudents',
    component: () => import('../views/enterprise/StudentList.vue'),
    meta: { requiresAuth: true, role: 'enterprise' }
  },
  // Notifications (accessible by all authenticated users)
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('../views/Notifications.vue'),
    meta: { requiresAuth: true }
  },
  // Profile (accessible by all authenticated users)
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  // 404 Not Found
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { requiresAuth: false }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Navigation guard for authentication and role-based access control
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!token || !user) {
      // Not authenticated, redirect to login
      next({
        path: '/login',
        query: { redirect: to.fullPath } // Save the intended destination
      });
      return;
    }
    
    // Check role-based access
    if (to.meta.role && user.role !== to.meta.role) {
      // User doesn't have the required role
      // Redirect to their appropriate dashboard
      const dashboardMap = {
        student: '/student',
        teacher: '/teacher',
        enterprise: '/enterprise'
      };
      
      const userDashboard = dashboardMap[user.role] || '/';
      
      if (to.path !== userDashboard) {
        next(userDashboard);
        return;
      }
    }
  } else {
    // Route doesn't require auth
    // If user is already logged in and trying to access login page, redirect to dashboard
    if (to.path === '/login' && token && user) {
      const dashboardMap = {
        student: '/student',
        teacher: '/teacher',
        enterprise: '/enterprise'
      };
      
      next(dashboardMap[user.role] || '/');
      return;
    }
  }
  
  // Update store with current user if not already set
  if (token && user && !store.state.auth.user) {
    store.commit('auth/SET_USER', user);
    store.commit('auth/SET_TOKEN', token);
  }
  
  next();
});

export default router;

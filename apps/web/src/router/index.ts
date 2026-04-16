import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/design-system',
      component: () => import('@/pages/DesignSystemPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/editor',
      component: () => import('@/pages/EditorPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/todos',
      component: () => import('@/pages/TodoPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/salesforce',
      component: () => import('@/pages/SalesforcePage.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

let authInitialized = false;

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authInitialized) {
    await authStore.fetchMe();
    authInitialized = true;
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' };
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'home' };
  }
});

export default router;

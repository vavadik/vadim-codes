import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/design-system',
      component: () => import('@/views/DesignSystemView.vue'),
    },
  ],
});

export default router;

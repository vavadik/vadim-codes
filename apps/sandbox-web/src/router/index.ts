import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/s/:id',
      name: 'snippet',
      component: () => import('@/pages/SnippetPage.vue'),
    },
  ],
});

export default router;

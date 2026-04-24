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
      path: '/room/:id',
      name: 'room',
      component: () => import('@/pages/RoomPage.vue'),
    },
  ],
});

export default router;

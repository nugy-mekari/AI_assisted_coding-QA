import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated } from './lib/api';
import LoginPage from './pages/LoginPage.vue';
import PosPage from './pages/PosPage.vue';
import OrdersPage from './pages/OrdersPage.vue';
import ReportsPage from './pages/ReportsPage.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginPage },
    { path: '/', component: PosPage },
    { path: '/orders', component: OrdersPage },
    { path: '/reports', component: ReportsPage },
  ],
});

router.beforeEach((to) => {
  if (to.path !== '/login' && !isAuthenticated()) return '/login';
  if (to.path === '/login' && isAuthenticated()) return '/';
});

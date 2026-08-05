import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/',
      component: () => import('@/components/layout/AuthLayout.vue'),
      meta: { requiresAuth: false },
      children: [
        { path: 'login', name: 'login', component: () => import('@/views/auth/LoginView.vue') },
        { path: 'register', name: 'register', component: () => import('@/views/auth/RegisterView.vue') },
        { path: 'magic-link', name: 'magic-link', component: () => import('@/views/auth/MagicLinkView.vue') },
      ],
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/views/auth/GoogleCallbackView.vue'),
    },
    {
      path: '/auth/magic-link',
      name: 'auth-magic-link-verify',
      component: () => import('@/views/auth/MagicLinkCallbackView.vue'),
    },
    {
      path: '/',
      component: () => import('@/components/layout/AuthenticatedLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: 'dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
        { path: 'transactions', name: 'transactions', component: () => import('@/views/TransactionsView.vue') },
        { path: 'budgets', name: 'budgets', component: () => import('@/views/BudgetsView.vue') },
        { path: 'goals', name: 'goals', component: () => import('@/views/GoalsView.vue') },
        { path: 'accounts', name: 'accounts', component: () => import('@/views/AccountsView.vue') },
        { path: 'credit-cards', name: 'credit-cards', component: () => import('@/views/CreditCardsView.vue') },
        { path: 'household', name: 'household', component: () => import('@/views/HouseholdView.vue') },
        { path: 'notifications', name: 'notifications', component: () => import('@/views/NotificationsView.vue') },
        { path: 'reports', name: 'reports', component: () => import('@/views/ReportsView.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
        { path: 'invites/:token', name: 'invite', component: () => import('@/views/InviteView.vue') },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.accessToken) {
    return { name: 'login' };
  }
  return true;
});

export default router;

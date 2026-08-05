import { createPinia, setActivePinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/stores/auth.store';
import router from './index';

describe('router auth guard', () => {
  beforeEach(() => {
    localStorage.clear();
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);
    setActivePinia(pinia);
  });

  it('redirects to login when navigating to a protected route without a token', async () => {
    await router.push('/dashboard');
    expect(router.currentRoute.value.name).toBe('login');
  });

  it('allows navigating to a protected route with a token', async () => {
    useAuthStore().setAuth({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { id: '1', email: 'a@a.com', fullName: 'Ana' } as never,
    });

    await router.push('/dashboard');
    expect(router.currentRoute.value.name).toBe('dashboard');
  });

  it('allows navigating to public routes without a token', async () => {
    await router.push('/login');
    expect(router.currentRoute.value.name).toBe('login');
  });
});

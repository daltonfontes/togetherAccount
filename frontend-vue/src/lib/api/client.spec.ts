import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function createFakeApiClient() {
  const responseHandlers: Array<{
    onFulfilled: (value: unknown) => unknown;
    onRejected: (error: unknown) => unknown;
  }> = [];

  const fn = vi.fn((config: unknown) => Promise.resolve({ config, data: { retried: true } }));
  Object.assign(fn, {
    interceptors: {
      request: { use: vi.fn() },
      response: {
        use: vi.fn((onFulfilled: (value: unknown) => unknown, onRejected: (error: unknown) => unknown) => {
          responseHandlers.push({ onFulfilled, onRejected });
        }),
      },
    },
    __responseHandlers: responseHandlers,
  });

  return fn as typeof fn & {
    __responseHandlers: typeof responseHandlers;
  };
}

const postMock = vi.fn();

vi.mock('axios', () => {
  const fakeClient = createFakeApiClient();
  return {
    default: {
      create: vi.fn(() => fakeClient),
      post: postMock,
      isAxiosError: () => true,
    },
  };
});

describe('apiClient 401 refresh queue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    postMock.mockReset();
    vi.resetModules();
  });

  it('shares a single refresh call across concurrent 401s and retries both requests', async () => {
    const { useAuthStore } = await import('@/stores/auth.store');
    useAuthStore().setAuth({
      accessToken: 'stale-token',
      refreshToken: 'refresh-token',
      user: { id: '1', email: 'a@a.com', fullName: 'Ana' } as never,
    });

    postMock.mockResolvedValue({
      data: {
        data: {
          accessToken: 'fresh-token',
          refreshToken: 'new-refresh-token',
          user: { id: '1', email: 'a@a.com', fullName: 'Ana' },
        },
      },
    });

    const { apiClient } = await import('./client');
    const onRejected = (apiClient as unknown as { __responseHandlers: Array<{ onRejected: (e: unknown) => unknown }> })
      .__responseHandlers[0].onRejected;

    const makeError = (url: string) => ({
      response: { status: 401 },
      config: { url, headers: {} },
    });

    const result1 = onRejected(makeError('/transactions'));
    const result2 = onRejected(makeError('/budgets'));

    await Promise.all([result1, result2]);

    expect(postMock).toHaveBeenCalledTimes(1);
    expect(apiClient).toHaveBeenCalledTimes(2);
    const [[firstRetryConfig], [secondRetryConfig]] = (apiClient as unknown as ReturnType<typeof vi.fn>).mock.calls;
    expect(firstRetryConfig.headers.Authorization).toBe('Bearer fresh-token');
    expect(secondRetryConfig.headers.Authorization).toBe('Bearer fresh-token');
  });

  it('does not attempt to refresh for requests to /auth/ endpoints', async () => {
    const { useAuthStore } = await import('@/stores/auth.store');
    useAuthStore().setAuth({
      accessToken: 'stale-token',
      refreshToken: 'refresh-token',
      user: { id: '1', email: 'a@a.com', fullName: 'Ana' } as never,
    });

    const { apiClient } = await import('./client');
    const onRejected = (apiClient as unknown as { __responseHandlers: Array<{ onRejected: (e: unknown) => unknown }> })
      .__responseHandlers[0].onRejected;

    await expect(
      onRejected({ response: { status: 401 }, config: { url: '/auth/login', headers: {} } }),
    ).rejects.toBeTruthy();

    expect(postMock).not.toHaveBeenCalled();
  });
});

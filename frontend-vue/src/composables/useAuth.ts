import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth.store';

export function useLogin() {
  const authStore = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      authStore.setAuth(data);
      queryClient.clear();
      router.push('/dashboard');
    },
  });
}

export function useRegister() {
  const authStore = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      authStore.setAuth(data);
      queryClient.clear();
      router.push('/dashboard');
    },
  });
}

export function useRequestMagicLink() {
  return useMutation({
    mutationFn: authApi.requestMagicLink,
  });
}

export function useVerifyMagicLink() {
  const authStore = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.verifyMagicLink,
    onSuccess: (data) => {
      authStore.setAuth(data);
      queryClient.clear();
      router.push('/dashboard');
    },
  });
}

export function useLogout() {
  const authStore = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      authStore.clear();
      queryClient.clear();
      router.push('/login');
    },
  });
}

export function useCurrentUser() {
  const { user } = storeToRefs(useAuthStore());
  return user;
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data);
      queryClient.clear();
      router.push('/dashboard');
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data);
      queryClient.clear();
      router.push('/dashboard');
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((state) => state.clear);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clear();
      queryClient.clear();
      router.push('/login');
    },
  });
}

export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}

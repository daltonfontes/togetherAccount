import { useMutation } from '@tanstack/vue-query';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import type { User } from '@/lib/types';

export function useUpdateProfile() {
  const authStore = useAuthStore();
  return useMutation({
    mutationFn: (payload: Partial<Pick<User, 'fullName' | 'avatarUrl' | 'phone' | 'themePreference'>>) =>
      authApi.updateProfile(payload),
    onSuccess: (user) => authStore.setUser(user),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(payload),
  });
}

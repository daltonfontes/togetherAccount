import { apiClient, unwrap } from './client';
import type { AuthResponse, User } from '@/lib/types';

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    unwrap<AuthResponse>(apiClient.post('/auth/login', payload)),

  register: (payload: { email: string; password: string; fullName: string }) =>
    unwrap<AuthResponse>(apiClient.post('/auth/register', payload)),

  logout: () => apiClient.post('/auth/logout'),

  me: () => unwrap<User>(apiClient.get('/users/me')),

  updateProfile: (payload: Partial<Pick<User, 'fullName' | 'avatarUrl' | 'phone' | 'themePreference'>>) =>
    unwrap<User>(apiClient.patch('/users/me', payload)),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/users/me/change-password', payload),
};

import { apiClient, unwrap } from './client';
import type { Notification, PaginatedResult } from '@/lib/types';

export const notificationsApi = {
  list: (page = 1, limit = 20) =>
    unwrap<PaginatedResult<Notification>>(apiClient.get('/notifications', { params: { page, limit } })),

  unreadCount: () => unwrap<{ count: number }>(apiClient.get('/notifications/unread-count')),

  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),

  markAllAsRead: () => apiClient.patch('/notifications/read-all'),

  remove: (id: string) => apiClient.delete(`/notifications/${id}`),
};

import { apiClient, unwrap } from './client';
import type { AuditLog, Household, HouseholdMember, HouseholdRole, PaginatedResult } from '@/lib/types';

export const householdsApi = {
  list: () => unwrap<Household[]>(apiClient.get('/households')),

  get: (householdId: string) => unwrap<Household>(apiClient.get(`/households/${householdId}`)),

  create: (payload: { name: string; description?: string; currency?: string }) =>
    unwrap<Household>(apiClient.post('/households', payload)),

  update: (householdId: string, payload: Partial<{ name: string; description: string; currency: string }>) =>
    unwrap<Household>(apiClient.patch(`/households/${householdId}`, payload)),

  remove: (householdId: string) => apiClient.delete(`/households/${householdId}`),

  leave: (householdId: string) => apiClient.post(`/households/${householdId}/leave`),

  listMembers: (householdId: string) =>
    unwrap<HouseholdMember[]>(apiClient.get(`/households/${householdId}/members`)),

  updateMemberRole: (householdId: string, memberId: string, role: HouseholdRole) =>
    unwrap<HouseholdMember>(
      apiClient.patch(`/households/${householdId}/members/${memberId}/role`, { role }),
    ),

  removeMember: (householdId: string, memberId: string) =>
    apiClient.delete(`/households/${householdId}/members/${memberId}`),

  auditLogs: (householdId: string, page = 1, limit = 20) =>
    unwrap<PaginatedResult<AuditLog>>(
      apiClient.get(`/households/${householdId}/audit-logs`, { params: { page, limit } }),
    ),
};

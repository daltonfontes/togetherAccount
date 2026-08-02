import { apiClient, unwrap } from './client';
import type { Goal } from '@/lib/types';

export interface GoalInput {
  name: string;
  description?: string;
  targetAmount: number;
  deadline?: string;
  color?: string;
  icon?: string;
}

export const goalsApi = {
  list: (householdId: string) => unwrap<Goal[]>(apiClient.get(`/households/${householdId}/goals`)),

  get: (householdId: string, id: string) =>
    unwrap<Goal>(apiClient.get(`/households/${householdId}/goals/${id}`)),

  create: (householdId: string, payload: GoalInput) =>
    unwrap<Goal>(apiClient.post(`/households/${householdId}/goals`, payload)),

  update: (householdId: string, id: string, payload: Partial<GoalInput>) =>
    unwrap<Goal>(apiClient.patch(`/households/${householdId}/goals/${id}`, payload)),

  remove: (householdId: string, id: string) =>
    apiClient.delete(`/households/${householdId}/goals/${id}`),

  addContribution: (householdId: string, id: string, payload: { amount: number; date: string; note?: string }) =>
    unwrap<Goal>(apiClient.post(`/households/${householdId}/goals/${id}/contributions`, payload)),
};

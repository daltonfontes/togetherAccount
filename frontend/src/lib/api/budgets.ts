import { apiClient, unwrap } from './client';
import type { BudgetProgress } from '@/lib/types';

export interface BudgetInput {
  categoryId: string;
  month: number;
  year: number;
  limitAmount: number;
  alertThreshold?: number;
}

export const budgetsApi = {
  list: (householdId: string, month?: number, year?: number) =>
    unwrap<BudgetProgress[]>(
      apiClient.get(`/households/${householdId}/budgets`, { params: { month, year } }),
    ),

  create: (householdId: string, payload: BudgetInput) =>
    unwrap(apiClient.post(`/households/${householdId}/budgets`, payload)),

  update: (householdId: string, id: string, payload: Partial<BudgetInput>) =>
    unwrap(apiClient.patch(`/households/${householdId}/budgets/${id}`, payload)),

  remove: (householdId: string, id: string) =>
    apiClient.delete(`/households/${householdId}/budgets/${id}`),
};

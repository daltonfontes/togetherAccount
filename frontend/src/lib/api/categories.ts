import { apiClient, unwrap } from './client';
import type { Category, TransactionType } from '@/lib/types';

export interface CategoryInput {
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
}

export const categoriesApi = {
  list: (householdId: string, type?: TransactionType) =>
    unwrap<Category[]>(
      apiClient.get(`/households/${householdId}/categories`, { params: type ? { type } : undefined }),
    ),

  create: (householdId: string, payload: CategoryInput) =>
    unwrap<Category>(apiClient.post(`/households/${householdId}/categories`, payload)),

  update: (householdId: string, id: string, payload: Partial<CategoryInput>) =>
    unwrap<Category>(apiClient.patch(`/households/${householdId}/categories/${id}`, payload)),

  remove: (householdId: string, id: string) =>
    apiClient.delete(`/households/${householdId}/categories/${id}`),
};

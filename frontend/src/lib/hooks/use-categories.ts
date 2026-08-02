import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, type CategoryInput } from '@/lib/api/categories';
import type { TransactionType } from '@/lib/types';

export function useCategories(householdId: string | null, type?: TransactionType) {
  return useQuery({
    queryKey: ['households', householdId, 'categories', type],
    queryFn: () => categoriesApi.list(householdId as string, type),
    enabled: !!householdId,
  });
}

export function useCreateCategory(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryInput) => categoriesApi.create(householdId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'categories'] }),
  });
}

export function useDeleteCategory(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.remove(householdId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'categories'] }),
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';
import { toValue } from 'vue';
import { categoriesApi, type CategoryInput } from '@/lib/api/categories';
import type { TransactionType } from '@/lib/types';

export function useCategories(
  householdId: MaybeRefOrGetter<string | null>,
  type?: MaybeRefOrGetter<TransactionType | undefined>,
) {
  return useQuery({
    queryKey: ['households', () => toValue(householdId), 'categories', type],
    queryFn: () => categoriesApi.list(toValue(householdId) as string, toValue(type)),
    enabled: () => !!toValue(householdId),
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

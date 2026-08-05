import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';
import { toValue } from 'vue';
import { budgetsApi, type BudgetInput } from '@/lib/api/budgets';

export function useBudgets(
  householdId: MaybeRefOrGetter<string | null>,
  month?: MaybeRefOrGetter<number | undefined>,
  year?: MaybeRefOrGetter<number | undefined>,
) {
  return useQuery({
    queryKey: ['households', () => toValue(householdId), 'budgets', month, year],
    queryFn: () => budgetsApi.list(toValue(householdId) as string, toValue(month), toValue(year)),
    enabled: () => !!toValue(householdId),
  });
}

export function useCreateBudget(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BudgetInput) => budgetsApi.create(householdId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['households', householdId, 'budgets'] }),
  });
}

export function useDeleteBudget(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetsApi.remove(householdId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['households', householdId, 'budgets'] }),
  });
}

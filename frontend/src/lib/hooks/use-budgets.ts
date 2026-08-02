import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetsApi, type BudgetInput } from '@/lib/api/budgets';

export function useBudgets(householdId: string | null, month?: number, year?: number) {
  return useQuery({
    queryKey: ['households', householdId, 'budgets', month, year],
    queryFn: () => budgetsApi.list(householdId as string, month, year),
    enabled: !!householdId,
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

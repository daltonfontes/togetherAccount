import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';
import { toValue } from 'vue';
import { transactionsApi, type TransactionInput, type TransactionQuery } from '@/lib/api/transactions';

function invalidateHouseholdData(queryClient: QueryClient, householdId: string) {
  queryClient.invalidateQueries({ queryKey: ['households', householdId, 'transactions'] });
  queryClient.invalidateQueries({ queryKey: ['households', householdId, 'dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['households', householdId, 'bank-accounts'] });
  queryClient.invalidateQueries({ queryKey: ['households', householdId, 'budgets'] });
  queryClient.invalidateQueries({ queryKey: ['households', householdId, 'reports'] });
}

export function useTransactions(
  householdId: MaybeRefOrGetter<string | null>,
  query: MaybeRefOrGetter<TransactionQuery> = {},
) {
  return useQuery({
    queryKey: ['households', () => toValue(householdId), 'transactions', query],
    queryFn: () => transactionsApi.list(toValue(householdId) as string, toValue(query)),
    enabled: () => !!toValue(householdId),
  });
}

export function usePendingSplits(householdId: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: ['households', () => toValue(householdId), 'transactions', 'pending-splits'],
    queryFn: () => transactionsApi.pendingSplits(toValue(householdId) as string),
    enabled: () => !!toValue(householdId),
  });
}

export function useCreateTransaction(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransactionInput) => transactionsApi.create(householdId, payload),
    onSuccess: () => invalidateHouseholdData(queryClient, householdId),
  });
}

export function useUpdateTransaction(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TransactionInput> }) =>
      transactionsApi.update(householdId, id, payload),
    onSuccess: () => invalidateHouseholdData(queryClient, householdId),
  });
}

export function useDeleteTransaction(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.remove(householdId, id),
    onSuccess: () => invalidateHouseholdData(queryClient, householdId),
  });
}

export function useSettleSplit(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transactionId, splitId }: { transactionId: string; splitId: string }) =>
      transactionsApi.settleSplit(householdId, transactionId, splitId),
    onSuccess: () => invalidateHouseholdData(queryClient, householdId),
  });
}

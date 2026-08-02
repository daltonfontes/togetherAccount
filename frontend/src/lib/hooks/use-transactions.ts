import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, type TransactionInput, type TransactionQuery } from '@/lib/api/transactions';

function invalidateHouseholdData(queryClient: ReturnType<typeof useQueryClient>, householdId: string) {
  queryClient.invalidateQueries({ queryKey: ['households', householdId, 'transactions'] });
  queryClient.invalidateQueries({ queryKey: ['households', householdId, 'dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['households', householdId, 'bank-accounts'] });
  queryClient.invalidateQueries({ queryKey: ['households', householdId, 'budgets'] });
  queryClient.invalidateQueries({ queryKey: ['households', householdId, 'reports'] });
}

export function useTransactions(householdId: string | null, query: TransactionQuery = {}) {
  return useQuery({
    queryKey: ['households', householdId, 'transactions', query],
    queryFn: () => transactionsApi.list(householdId as string, query),
    enabled: !!householdId,
  });
}

export function usePendingSplits(householdId: string | null) {
  return useQuery({
    queryKey: ['households', householdId, 'transactions', 'pending-splits'],
    queryFn: () => transactionsApi.pendingSplits(householdId as string),
    enabled: !!householdId,
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

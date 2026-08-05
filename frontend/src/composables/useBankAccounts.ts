import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';
import { toValue } from 'vue';
import { bankAccountsApi, type BankAccountInput } from '@/lib/api/bank-accounts';

export function useBankAccounts(householdId: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: ['households', () => toValue(householdId), 'bank-accounts'],
    queryFn: () => bankAccountsApi.list(toValue(householdId) as string),
    enabled: () => !!toValue(householdId),
  });
}

export function useCreateBankAccount(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BankAccountInput) => bankAccountsApi.create(householdId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'dashboard'] });
    },
  });
}

export function useUpdateBankAccount(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BankAccountInput> }) =>
      bankAccountsApi.update(householdId, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'dashboard'] });
    },
  });
}

export function useDeleteBankAccount(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bankAccountsApi.remove(householdId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'dashboard'] });
    },
  });
}

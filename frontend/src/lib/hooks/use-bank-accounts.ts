import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bankAccountsApi, type BankAccountInput } from '@/lib/api/bank-accounts';

export function useBankAccounts(householdId: string | null) {
  return useQuery({
    queryKey: ['households', householdId, 'bank-accounts'],
    queryFn: () => bankAccountsApi.list(householdId as string),
    enabled: !!householdId,
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

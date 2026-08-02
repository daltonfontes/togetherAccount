import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { creditCardsApi, type CreditCardInput } from '@/lib/api/credit-cards';

export function useCreditCards(householdId: string | null) {
  return useQuery({
    queryKey: ['households', householdId, 'credit-cards'],
    queryFn: () => creditCardsApi.list(householdId as string),
    enabled: !!householdId,
  });
}

export function useCreditCardInvoice(householdId: string | null, cardId: string | null) {
  return useQuery({
    queryKey: ['households', householdId, 'credit-cards', cardId, 'invoice'],
    queryFn: () => creditCardsApi.invoice(householdId as string, cardId as string),
    enabled: !!householdId && !!cardId,
  });
}

export function useCreateCreditCard(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreditCardInput) => creditCardsApi.create(householdId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'credit-cards'] }),
  });
}

export function useUpdateCreditCard(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreditCardInput> }) =>
      creditCardsApi.update(householdId, id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'credit-cards'] }),
  });
}

export function useDeleteCreditCard(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => creditCardsApi.remove(householdId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'credit-cards'] }),
  });
}

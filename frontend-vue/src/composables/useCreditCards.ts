import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';
import { toValue } from 'vue';
import { creditCardsApi, type CreditCardInput } from '@/lib/api/credit-cards';

export function useCreditCards(householdId: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: ['households', () => toValue(householdId), 'credit-cards'],
    queryFn: () => creditCardsApi.list(toValue(householdId) as string),
    enabled: () => !!toValue(householdId),
  });
}

export function useCreditCardInvoice(
  householdId: MaybeRefOrGetter<string | null>,
  cardId: MaybeRefOrGetter<string | null>,
) {
  return useQuery({
    queryKey: ['households', () => toValue(householdId), 'credit-cards', cardId, 'invoice'],
    queryFn: () => creditCardsApi.invoice(toValue(householdId) as string, toValue(cardId) as string),
    enabled: () => !!toValue(householdId) && !!toValue(cardId),
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

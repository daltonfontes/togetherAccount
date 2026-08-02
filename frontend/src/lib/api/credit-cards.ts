import { apiClient, unwrap } from './client';
import type { CardBrand, CreditCard, CreditCardInvoice } from '@/lib/types';

export interface CreditCardInput {
  name: string;
  brand?: CardBrand;
  creditLimit: number;
  closingDay: number;
  dueDay: number;
  color?: string;
}

export const creditCardsApi = {
  list: (householdId: string) =>
    unwrap<CreditCard[]>(apiClient.get(`/households/${householdId}/credit-cards`)),

  create: (householdId: string, payload: CreditCardInput) =>
    unwrap<CreditCard>(apiClient.post(`/households/${householdId}/credit-cards`, payload)),

  update: (householdId: string, id: string, payload: Partial<CreditCardInput>) =>
    unwrap<CreditCard>(apiClient.patch(`/households/${householdId}/credit-cards/${id}`, payload)),

  remove: (householdId: string, id: string) =>
    apiClient.delete(`/households/${householdId}/credit-cards/${id}`),

  invoice: (householdId: string, id: string) =>
    unwrap<CreditCardInvoice>(apiClient.get(`/households/${householdId}/credit-cards/${id}/invoice`)),
};

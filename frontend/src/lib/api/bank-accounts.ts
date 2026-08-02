import { apiClient, unwrap } from './client';
import type { AccountType, BankAccount } from '@/lib/types';

export interface BankAccountInput {
  name: string;
  bank?: string;
  type?: AccountType;
  balance?: number;
  color?: string;
  includeInTotal?: boolean;
}

export const bankAccountsApi = {
  list: (householdId: string) =>
    unwrap<BankAccount[]>(apiClient.get(`/households/${householdId}/bank-accounts`)),

  create: (householdId: string, payload: BankAccountInput) =>
    unwrap<BankAccount>(apiClient.post(`/households/${householdId}/bank-accounts`, payload)),

  update: (householdId: string, id: string, payload: Partial<BankAccountInput>) =>
    unwrap<BankAccount>(apiClient.patch(`/households/${householdId}/bank-accounts/${id}`, payload)),

  remove: (householdId: string, id: string) =>
    apiClient.delete(`/households/${householdId}/bank-accounts/${id}`),
};

import { apiClient, unwrap } from './client';
import type {
  PaginatedResult,
  RecurrenceFrequency,
  SplitMethod,
  Transaction,
  TransactionSplit,
  TransactionStatus,
  TransactionType,
} from '@/lib/types';

export interface TransactionSplitInput {
  userId: string;
  amount?: number;
  percentage?: number;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  categoryId: string;
  bankAccountId?: string;
  creditCardId?: string;
  isRecurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceEndDate?: string;
  isShared?: boolean;
  splitMethod?: SplitMethod;
  splits?: TransactionSplitInput[];
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
  bankAccountId?: string;
  creditCardId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
}

export const transactionsApi = {
  list: (householdId: string, query: TransactionQuery = {}) =>
    unwrap<PaginatedResult<Transaction>>(
      apiClient.get(`/households/${householdId}/transactions`, { params: query }),
    ),

  get: (householdId: string, id: string) =>
    unwrap<Transaction>(apiClient.get(`/households/${householdId}/transactions/${id}`)),

  create: (householdId: string, payload: TransactionInput) =>
    unwrap<Transaction>(apiClient.post(`/households/${householdId}/transactions`, payload)),

  update: (householdId: string, id: string, payload: Partial<TransactionInput>) =>
    unwrap<Transaction>(apiClient.patch(`/households/${householdId}/transactions/${id}`, payload)),

  remove: (householdId: string, id: string) =>
    apiClient.delete(`/households/${householdId}/transactions/${id}`),

  pendingSplits: (householdId: string) =>
    unwrap<TransactionSplit[]>(apiClient.get(`/households/${householdId}/transactions/pending-splits`)),

  settleSplit: (householdId: string, transactionId: string, splitId: string) =>
    unwrap<TransactionSplit>(
      apiClient.patch(
        `/households/${householdId}/transactions/${transactionId}/splits/${splitId}/settle`,
      ),
    ),
};

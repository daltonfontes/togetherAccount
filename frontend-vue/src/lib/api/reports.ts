import { apiClient, unwrap } from './client';
import type { CashflowPoint, CategoryBreakdown, DashboardSummary, MemberSpending } from '@/lib/types';

export const reportsApi = {
  dashboard: (householdId: string) =>
    unwrap<DashboardSummary>(apiClient.get(`/households/${householdId}/dashboard`)),

  cashflow: (householdId: string, months = 6) =>
    unwrap<CashflowPoint[]>(
      apiClient.get(`/households/${householdId}/reports/cashflow`, { params: { months } }),
    ),

  byCategory: (householdId: string, month?: number, year?: number) =>
    unwrap<CategoryBreakdown[]>(
      apiClient.get(`/households/${householdId}/reports/by-category`, { params: { month, year } }),
    ),

  memberSpending: (householdId: string, month?: number, year?: number) =>
    unwrap<MemberSpending[]>(
      apiClient.get(`/households/${householdId}/reports/member-spending`, { params: { month, year } }),
    ),
};

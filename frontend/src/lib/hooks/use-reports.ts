import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports';

export function useDashboard(householdId: string | null) {
  return useQuery({
    queryKey: ['households', householdId, 'dashboard'],
    queryFn: () => reportsApi.dashboard(householdId as string),
    enabled: !!householdId,
  });
}

export function useCashflow(householdId: string | null, months = 6) {
  return useQuery({
    queryKey: ['households', householdId, 'reports', 'cashflow', months],
    queryFn: () => reportsApi.cashflow(householdId as string, months),
    enabled: !!householdId,
  });
}

export function useCategoryBreakdown(householdId: string | null, month?: number, year?: number) {
  return useQuery({
    queryKey: ['households', householdId, 'reports', 'by-category', month, year],
    queryFn: () => reportsApi.byCategory(householdId as string, month, year),
    enabled: !!householdId,
  });
}

export function useMemberSpending(householdId: string | null, month?: number, year?: number) {
  return useQuery({
    queryKey: ['households', householdId, 'reports', 'member-spending', month, year],
    queryFn: () => reportsApi.memberSpending(householdId as string, month, year),
    enabled: !!householdId,
  });
}

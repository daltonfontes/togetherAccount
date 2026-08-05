import { useQuery } from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';
import { toValue } from 'vue';
import { reportsApi } from '@/lib/api/reports';

export function useDashboard(householdId: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: ['households', () => toValue(householdId), 'dashboard'],
    queryFn: () => reportsApi.dashboard(toValue(householdId) as string),
    enabled: () => !!toValue(householdId),
  });
}

export function useCashflow(householdId: MaybeRefOrGetter<string | null>, months: MaybeRefOrGetter<number> = 6) {
  return useQuery({
    queryKey: ['households', () => toValue(householdId), 'reports', 'cashflow', months],
    queryFn: () => reportsApi.cashflow(toValue(householdId) as string, toValue(months)),
    enabled: () => !!toValue(householdId),
  });
}

export function useCategoryBreakdown(
  householdId: MaybeRefOrGetter<string | null>,
  month?: MaybeRefOrGetter<number | undefined>,
  year?: MaybeRefOrGetter<number | undefined>,
) {
  return useQuery({
    queryKey: ['households', () => toValue(householdId), 'reports', 'by-category', month, year],
    queryFn: () => reportsApi.byCategory(toValue(householdId) as string, toValue(month), toValue(year)),
    enabled: () => !!toValue(householdId),
  });
}

export function useMemberSpending(
  householdId: MaybeRefOrGetter<string | null>,
  month?: MaybeRefOrGetter<number | undefined>,
  year?: MaybeRefOrGetter<number | undefined>,
) {
  return useQuery({
    queryKey: ['households', () => toValue(householdId), 'reports', 'member-spending', month, year],
    queryFn: () => reportsApi.memberSpending(toValue(householdId) as string, toValue(month), toValue(year)),
    enabled: () => !!toValue(householdId),
  });
}

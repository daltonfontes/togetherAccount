import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { householdsApi } from '@/lib/api/households';
import type { Household, HouseholdRole } from '@/lib/types';

export const householdKeys = {
  all: ['households'] as const,
  detail: (id: string) => ['households', id] as const,
  members: (id: string) => ['households', id, 'members'] as const,
  auditLogs: (id: string) => ['households', id, 'audit-logs'] as const,
};

export function useHouseholds() {
  return useQuery({ queryKey: householdKeys.all, queryFn: householdsApi.list });
}

export function useHousehold(householdId: string | null) {
  return useQuery({
    queryKey: householdId ? householdKeys.detail(householdId) : ['households', 'none'],
    queryFn: () => householdsApi.get(householdId as string),
    enabled: !!householdId,
  });
}

export function useHouseholdMembers(householdId: string | null) {
  return useQuery({
    queryKey: householdId ? householdKeys.members(householdId) : ['households', 'none', 'members'],
    queryFn: () => householdsApi.listMembers(householdId as string),
    enabled: !!householdId,
  });
}

export function useCreateHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string; currency?: string }) =>
      householdsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: householdKeys.all }),
  });
}

export function useUpdateHousehold(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Pick<Household, 'name' | 'description' | 'currency'>>) =>
      householdsApi.update(householdId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: householdKeys.detail(householdId) });
      queryClient.invalidateQueries({ queryKey: householdKeys.all });
    },
  });
}

export function useUpdateMemberRole(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: HouseholdRole }) =>
      householdsApi.updateMemberRole(householdId, memberId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: householdKeys.members(householdId) }),
  });
}

export function useRemoveMember(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => householdsApi.removeMember(householdId, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: householdKeys.members(householdId) }),
  });
}

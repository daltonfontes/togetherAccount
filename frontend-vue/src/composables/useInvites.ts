import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';
import { toValue } from 'vue';
import { invitesApi } from '@/lib/api/invites';
import { householdKeys } from './useHouseholds';
import type { HouseholdRole } from '@/lib/types';

export function useHouseholdInvites(householdId: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: ['households', () => toValue(householdId), 'invites'],
    queryFn: () => invitesApi.listForHousehold(toValue(householdId) as string),
    enabled: () => !!toValue(householdId),
  });
}

export function useMyInvites() {
  return useQuery({ queryKey: ['invites', 'me'], queryFn: invitesApi.myInvites });
}

export function useCreateInvite(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; role?: HouseholdRole }) =>
      invitesApi.create(householdId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'invites'] }),
  });
}

export function useRevokeInvite(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => invitesApi.revoke(householdId, inviteId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'invites'] }),
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => invitesApi.accept(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: householdKeys.all });
      queryClient.invalidateQueries({ queryKey: ['invites', 'me'] });
    },
  });
}

export function useDeclineInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => invitesApi.decline(token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invites', 'me'] }),
  });
}

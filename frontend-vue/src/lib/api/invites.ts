import { apiClient, unwrap } from './client';
import type { HouseholdMember, HouseholdRole, Invite } from '@/lib/types';

export const invitesApi = {
  create: (householdId: string, payload: { email: string; role?: HouseholdRole }) =>
    unwrap<Invite>(apiClient.post(`/households/${householdId}/invites`, payload)),

  listForHousehold: (householdId: string) =>
    unwrap<Invite[]>(apiClient.get(`/households/${householdId}/invites`)),

  revoke: (householdId: string, inviteId: string) =>
    apiClient.delete(`/households/${householdId}/invites/${inviteId}`),

  myInvites: () => unwrap<Invite[]>(apiClient.get('/invites/me')),

  accept: (token: string) => unwrap<HouseholdMember>(apiClient.post(`/invites/${token}/accept`)),

  decline: (token: string) => apiClient.post(`/invites/${token}/decline`),
};

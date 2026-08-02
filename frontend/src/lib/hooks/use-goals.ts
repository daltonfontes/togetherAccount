import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goalsApi, type GoalInput } from '@/lib/api/goals';

export function useGoals(householdId: string | null) {
  return useQuery({
    queryKey: ['households', householdId, 'goals'],
    queryFn: () => goalsApi.list(householdId as string),
    enabled: !!householdId,
  });
}

export function useCreateGoal(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GoalInput) => goalsApi.create(householdId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['households', householdId, 'goals'] }),
  });
}

export function useDeleteGoal(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.remove(householdId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['households', householdId, 'goals'] }),
  });
}

export function useAddContribution(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { amount: number; date: string; note?: string } }) =>
      goalsApi.addContribution(householdId, id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['households', householdId, 'goals'] }),
  });
}

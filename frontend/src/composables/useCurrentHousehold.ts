import { computed, watchEffect } from 'vue';
import { useHouseholds } from './useHouseholds';
import { useHouseholdStore } from '@/stores/household.store';

export function useCurrentHousehold() {
  const { data: households, isLoading } = useHouseholds();
  const householdStore = useHouseholdStore();

  watchEffect(() => {
    if (!households.value || households.value.length === 0) return;
    const exists = households.value.some((h) => h.id === householdStore.currentHouseholdId);
    if (!householdStore.currentHouseholdId || !exists) {
      householdStore.setCurrentHouseholdId(households.value[0].id);
    }
  });

  const household = computed(
    () =>
      households.value?.find((h) => h.id === householdStore.currentHouseholdId) ??
      households.value?.[0] ??
      null,
  );

  return {
    households: computed(() => households.value ?? []),
    household,
    householdId: computed(() => household.value?.id ?? null),
    isLoading,
    setCurrentHouseholdId: householdStore.setCurrentHouseholdId,
  };
}

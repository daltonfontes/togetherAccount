'use client';

import * as React from 'react';
import { useHouseholds } from './use-households';
import { useHouseholdStore } from '@/lib/stores/household-store';

export function useCurrentHousehold() {
  const { data: households, isLoading } = useHouseholds();
  const { currentHouseholdId, setCurrentHouseholdId } = useHouseholdStore();

  React.useEffect(() => {
    if (!households || households.length === 0) return;
    const exists = households.some((h) => h.id === currentHouseholdId);
    if (!currentHouseholdId || !exists) {
      setCurrentHouseholdId(households[0].id);
    }
  }, [households, currentHouseholdId, setCurrentHouseholdId]);

  const household = households?.find((h) => h.id === currentHouseholdId) ?? households?.[0] ?? null;

  return {
    households: households ?? [],
    household,
    householdId: household?.id ?? null,
    isLoading,
    setCurrentHouseholdId,
  };
}

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface HouseholdState {
  currentHouseholdId: string | null;
  setCurrentHouseholdId: (id: string | null) => void;
}

export const useHouseholdStore = create<HouseholdState>()(
  persist(
    (set) => ({
      currentHouseholdId: null,
      setCurrentHouseholdId: (id) => set({ currentHouseholdId: id }),
    }),
    {
      name: 'together-account-household',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

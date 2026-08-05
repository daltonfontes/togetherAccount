import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useHouseholdStore = defineStore(
  'together-account-household',
  () => {
    const currentHouseholdId = ref<string | null>(null);

    function setCurrentHouseholdId(id: string | null) {
      currentHouseholdId.value = id;
    }

    return { currentHouseholdId, setCurrentHouseholdId };
  },
  {
    persist: true,
  },
);

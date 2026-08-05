<script setup lang="ts">
import { computed, ref } from 'vue';
import { Plus, Target } from '@lucide/vue';
import Button from '@/components/ui/Button.vue';
import EmptyState from '@/components/layout/EmptyState.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import ContributionDialog from '@/components/goals/ContributionDialog.vue';
import GoalCard from '@/components/goals/GoalCard.vue';
import GoalFormDialog from '@/components/goals/GoalFormDialog.vue';
import { useCurrentHousehold } from '@/composables/useCurrentHousehold';
import { useGoals } from '@/composables/useGoals';

const { householdId } = useCurrentHousehold();
const open = ref(false);
const contributeGoalId = ref<string | null>(null);
const contributeOpen = computed({
  get: () => !!contributeGoalId.value,
  set: (value) => {
    if (!value) contributeGoalId.value = null;
  },
});
const { data: goals, isLoading } = useGoals(householdId);
</script>

<template>
  <div>
    <PageHeader title="Metas financeiras" description="Economize junto para os objetivos da casa">
      <template #actions>
        <Button :disabled="!householdId" @click="open = true">
          <Plus class="h-4 w-4" />
          Nova meta
        </Button>
      </template>
    </PageHeader>

    <div v-if="isLoading" class="grid gap-4 sm:grid-cols-2">
      <Skeleton v-for="i in 4" :key="i" class="h-40" />
    </div>
    <div v-else-if="goals && goals.length > 0" class="grid gap-4 sm:grid-cols-2">
      <GoalCard
        v-for="goal in goals"
        :key="goal.id"
        :household-id="householdId!"
        :goal="goal"
        @contribute="contributeGoalId = $event"
      />
    </div>
    <EmptyState v-else :icon="Target" title="Nenhuma meta cadastrada" description="Crie metas para economizar em conjunto" />

    <template v-if="householdId">
      <GoalFormDialog v-model:open="open" :household-id="householdId" />
      <ContributionDialog v-model:open="contributeOpen" :household-id="householdId" :goal-id="contributeGoalId" />
    </template>
  </div>
</template>

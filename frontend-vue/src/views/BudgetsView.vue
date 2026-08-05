<script setup lang="ts">
import { ref } from 'vue';
import { PiggyBank, Plus } from '@lucide/vue';
import Button from '@/components/ui/Button.vue';
import EmptyState from '@/components/layout/EmptyState.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import BudgetCard from '@/components/budgets/BudgetCard.vue';
import BudgetFormDialog from '@/components/budgets/BudgetFormDialog.vue';
import { useBudgets } from '@/composables/useBudgets';
import { useCurrentHousehold } from '@/composables/useCurrentHousehold';

const { householdId } = useCurrentHousehold();
const open = ref(false);
const now = new Date();
const { data: budgets, isLoading } = useBudgets(householdId, now.getMonth() + 1, now.getFullYear());
</script>

<template>
  <div>
    <PageHeader title="Orçamentos" description="Defina limites de gastos por categoria">
      <template #actions>
        <Button :disabled="!householdId" @click="open = true">
          <Plus class="h-4 w-4" />
          Novo orçamento
        </Button>
      </template>
    </PageHeader>

    <div v-if="isLoading" class="grid gap-4 sm:grid-cols-2">
      <Skeleton v-for="i in 4" :key="i" class="h-28" />
    </div>
    <div v-else-if="budgets && budgets.length > 0" class="grid gap-4 sm:grid-cols-2">
      <BudgetCard v-for="item in budgets" :key="item.budget.id" :household-id="householdId!" :item="item" />
    </div>
    <EmptyState
      v-else
      :icon="PiggyBank"
      title="Nenhum orçamento definido"
      description="Crie orçamentos mensais para controlar seus gastos"
    />

    <BudgetFormDialog v-if="householdId" v-model:open="open" :household-id="householdId" />
  </div>
</template>

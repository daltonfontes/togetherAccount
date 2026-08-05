<script setup lang="ts">
import { computed, ref } from 'vue';
import { Plus } from '@lucide/vue';
import Button from '@/components/ui/Button.vue';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/layout/PageHeader.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import TransactionFormDialog from '@/components/transactions/TransactionFormDialog.vue';
import TransactionsTable from '@/components/transactions/TransactionsTable.vue';
import { useCurrentHousehold } from '@/composables/useCurrentHousehold';
import { useTransactions } from '@/composables/useTransactions';

const { householdId } = useCurrentHousehold();
const open = ref(false);
const { data, isLoading } = useTransactions(householdId, { limit: 50 });
const items = computed(() => data.value?.items ?? []);
</script>

<template>
  <div>
    <PageHeader title="Transações" description="Receitas e despesas da casa">
      <template #actions>
        <Button :disabled="!householdId" @click="open = true">
          <Plus class="h-4 w-4" />
          Nova transação
        </Button>
      </template>
    </PageHeader>

    <Card>
      <CardContent class="pt-6">
        <div v-if="isLoading" class="space-y-2">
          <Skeleton v-for="i in 5" :key="i" class="h-10 w-full" />
        </div>
        <TransactionsTable v-else :household-id="householdId ?? ''" :transactions="items" />
      </CardContent>
    </Card>

    <TransactionFormDialog v-if="householdId" v-model:open="open" :household-id="householdId" />
  </div>
</template>

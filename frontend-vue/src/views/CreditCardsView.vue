<script setup lang="ts">
import { ref } from 'vue';
import { CreditCard as CardIcon, Plus } from '@lucide/vue';
import Button from '@/components/ui/Button.vue';
import EmptyState from '@/components/layout/EmptyState.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import CreditCardFormDialog from '@/components/credit-cards/CreditCardFormDialog.vue';
import CreditCardItem from '@/components/credit-cards/CreditCardItem.vue';
import { useCreditCards } from '@/composables/useCreditCards';
import { useCurrentHousehold } from '@/composables/useCurrentHousehold';

const { householdId } = useCurrentHousehold();
const open = ref(false);
const { data: cards, isLoading } = useCreditCards(householdId);
</script>

<template>
  <div>
    <PageHeader title="Cartões de crédito" description="Acompanhe faturas e limites">
      <template #actions>
        <Button :disabled="!householdId" @click="open = true">
          <Plus class="h-4 w-4" />
          Novo cartão
        </Button>
      </template>
    </PageHeader>

    <div v-if="isLoading" class="grid gap-4 sm:grid-cols-2">
      <Skeleton v-for="i in 4" :key="i" class="h-40" />
    </div>
    <div v-else-if="cards && cards.length > 0" class="grid gap-4 sm:grid-cols-2">
      <CreditCardItem v-for="card in cards" :key="card.id" :household-id="householdId!" :card="card" />
    </div>
    <EmptyState v-else :icon="CardIcon" title="Nenhum cartão cadastrado" description="Adicione um cartão para acompanhar faturas" />

    <CreditCardFormDialog v-if="householdId" v-model:open="open" :household-id="householdId" />
  </div>
</template>

<script setup lang="ts">
import { CreditCard as CardIcon, Trash2 } from '@lucide/vue';
import Button from '@/components/ui/Button.vue';
import { Card, CardContent } from '@/components/ui/card';
import Progress from '@/components/ui/Progress.vue';
import { useCreditCardInvoice, useDeleteCreditCard } from '@/composables/useCreditCards';
import type { CreditCard } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const props = defineProps<{ householdId: string; card: CreditCard }>();

const { data: invoice } = useCreditCardInvoice(props.householdId, props.card.id);
const deleteCard = useDeleteCreditCard(props.householdId);
</script>

<template>
  <Card>
    <CardContent class="space-y-4 p-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border text-white"
            :style="{ backgroundColor: card.color }"
          >
            <CardIcon class="h-5 w-5" />
          </div>
          <div>
            <p class="font-medium">{{ card.name }}</p>
            <p class="text-xs capitalize text-muted-foreground">{{ card.brand }}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Excluir cartão" @click="deleteCard.mutate(card.id)">
          <Trash2 class="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Fatura atual</span>
          <span class="font-medium">{{ formatCurrency(invoice?.total ?? 0) }}</span>
        </div>
        <Progress :model-value="invoice?.usedPercentage ?? 0" />
        <div class="flex items-center justify-between text-xs text-muted-foreground">
          <span>Limite: {{ formatCurrency(card.creditLimit) }}</span>
          <span>Vence dia {{ card.dueDay }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

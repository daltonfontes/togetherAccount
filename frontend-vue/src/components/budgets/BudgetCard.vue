<script setup lang="ts">
import { AlertTriangle, Trash2 } from '@lucide/vue';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';
import { Card, CardContent } from '@/components/ui/card';
import Progress from '@/components/ui/Progress.vue';
import { useDeleteBudget } from '@/composables/useBudgets';
import type { BudgetProgress } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const props = defineProps<{ householdId: string; item: BudgetProgress }>();

const deleteBudget = useDeleteBudget(props.householdId);
</script>

<template>
  <Card>
    <CardContent class="space-y-3 p-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: item.budget.category?.color }" />
          <p class="font-medium">{{ item.budget.category?.name }}</p>
          <Badge v-if="item.isExceeded" variant="destructive" class="gap-1">
            <AlertTriangle class="h-3 w-3" /> Estourado
          </Badge>
          <Badge v-else-if="item.isNearLimit" variant="secondary">Quase no limite</Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Excluir orçamento"
          @click="deleteBudget.mutate(item.budget.id)"
        >
          <Trash2 class="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      <Progress
        :model-value="Math.min(item.percentageUsed, 100)"
        :indicator-class="item.isExceeded ? 'bg-destructive' : undefined"
      />
      <div class="flex items-center justify-between text-sm text-muted-foreground">
        <span>{{ formatCurrency(item.spent) }} gastos</span>
        <span>{{ formatCurrency(item.budget.limitAmount) }} limite</span>
      </div>
    </CardContent>
  </Card>
</template>

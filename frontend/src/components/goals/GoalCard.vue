<script setup lang="ts">
import { computed } from 'vue';
import { PlusCircle, Target, Trash2 } from '@lucide/vue';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';
import { Card, CardContent } from '@/components/ui/card';
import Progress from '@/components/ui/Progress.vue';
import { useDeleteGoal } from '@/composables/useGoals';
import { GoalStatus, type Goal } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

const props = defineProps<{ householdId: string; goal: Goal }>();
const emit = defineEmits<{ contribute: [goalId: string] }>();

const deleteGoal = useDeleteGoal(props.householdId);
const progress = computed(() =>
  props.goal.targetAmount > 0 ? (props.goal.currentAmount / props.goal.targetAmount) * 100 : 0,
);
</script>

<template>
  <Card>
    <CardContent class="space-y-4 p-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border text-white"
            :style="{ backgroundColor: goal.color }"
          >
            <Target class="h-5 w-5" />
          </div>
          <div>
            <p class="font-medium">{{ goal.name }}</p>
            <p v-if="goal.deadline" class="text-xs text-muted-foreground">Prazo: {{ formatDate(goal.deadline) }}</p>
          </div>
        </div>
        <Badge v-if="goal.status === GoalStatus.COMPLETED" variant="success">Concluída</Badge>
      </div>

      <div class="space-y-1.5">
        <Progress :model-value="Math.min(progress, 100)" />
        <div class="flex items-center justify-between text-sm text-muted-foreground">
          <span>{{ formatCurrency(goal.currentAmount) }}</span>
          <span>{{ formatCurrency(goal.targetAmount) }}</span>
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <Button variant="outline" size="sm" @click="emit('contribute', goal.id)">
          <PlusCircle class="h-4 w-4" />
          Contribuir
        </Button>
        <Button variant="ghost" size="icon" aria-label="Excluir meta" @click="deleteGoal.mutate(goal.id)">
          <Trash2 class="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { Target } from '@lucide/vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyState from '@/components/layout/EmptyState.vue';
import Progress from '@/components/ui/Progress.vue';
import { formatCurrency } from '@/lib/utils';

interface DashboardGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
}

defineProps<{ goals: DashboardGoal[] }>();
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between">
      <CardTitle class="text-base">Metas em andamento</CardTitle>
      <RouterLink to="/goals" class="text-xs font-medium text-primary hover:underline">
        Ver todas
      </RouterLink>
    </CardHeader>
    <CardContent class="space-y-4">
      <EmptyState
        v-if="goals.length === 0"
        :icon="Target"
        title="Nenhuma meta ativa"
        description="Crie uma meta financeira para começar"
      />
      <div v-for="goal in goals" v-else :key="goal.id" class="space-y-1.5">
        <div class="flex items-center justify-between text-sm">
          <span class="font-medium">{{ goal.name }}</span>
          <span class="text-muted-foreground">
            {{ formatCurrency(goal.currentAmount) }} / {{ formatCurrency(goal.targetAmount) }}
          </span>
        </div>
        <Progress :model-value="Math.min(goal.progress, 100)" />
      </div>
    </CardContent>
  </Card>
</template>

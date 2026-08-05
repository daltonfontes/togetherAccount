<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import type { ChartData, ChartOptions } from 'chart.js';
import { PieChart as PieChartIcon } from '@lucide/vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyState from '@/components/layout/EmptyState.vue';
import { chartChrome, getCategoricalColor } from '@/lib/chart-colors';
import { useChartMode } from '@/composables/useChartMode';
import type { CategoryBreakdown } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const MAX_SLICES = 7;

const props = defineProps<{ data: CategoryBreakdown[] }>();

const mode = useChartMode();

const chartEntries = computed(() => {
  const sorted = [...props.data].sort((a, b) => b.total - a.total);
  const top = sorted.slice(0, MAX_SLICES);
  const rest = sorted.slice(MAX_SLICES);
  const restTotal = rest.reduce((sum, item) => sum + item.total, 0);
  return restTotal > 0
    ? [...top, { categoryId: 'other', name: 'Outros', color: '', total: restTotal }]
    : top;
});

const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: chartEntries.value.map((entry) => entry.name),
  datasets: [
    {
      data: chartEntries.value.map((entry) => entry.total),
      backgroundColor: chartEntries.value.map((_, index) => getCategoricalColor(index, mode.value)),
      borderColor: chartChrome[mode.value].primaryInk,
      borderWidth: 3,
    },
  ],
}));

const chartOptions = computed<ChartOptions<'doughnut'>>(() => {
  const chrome = chartChrome[mode.value];
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: chrome.secondaryInk, font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: chrome.surface,
        titleColor: chrome.primaryInk,
        bodyColor: chrome.primaryInk,
        borderColor: chrome.primaryInk,
        borderWidth: 2,
        callbacks: {
          label: (context) => `${context.label}: ${formatCurrency(Number(context.raw))}`,
        },
      },
    },
  };
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-base">Despesas por categoria</CardTitle>
    </CardHeader>
    <CardContent v-if="!data.length">
      <EmptyState :icon="PieChartIcon" title="Sem despesas neste período" />
    </CardContent>
    <CardContent v-else class="h-80">
      <Doughnut :data="chartData" :options="chartOptions" />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import type { ChartData, ChartOptions } from 'chart.js';
import { Users } from '@lucide/vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyState from '@/components/layout/EmptyState.vue';
import { chartChrome, getCategoricalColor } from '@/lib/chart-colors';
import { useChartMode } from '@/composables/useChartMode';
import type { MemberSpending } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const props = defineProps<{ data: MemberSpending[] }>();

const mode = useChartMode();

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: props.data.map((entry) => entry.name),
  datasets: [
    {
      data: props.data.map((entry) => entry.total),
      backgroundColor: props.data.map((_, index) => getCategoricalColor(index, mode.value)),
      borderColor: chartChrome[mode.value].primaryInk,
      borderWidth: 2,
      borderRadius: 4,
      maxBarThickness: 28,
    },
  ],
}));

const chartOptions = computed<ChartOptions<'bar'>>(() => {
  const chrome = chartChrome[mode.value];
  return {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: chrome.gridline },
        ticks: { color: chrome.mutedInk, font: { size: 12 }, callback: (value) => formatCurrency(Number(value)) },
      },
      y: {
        grid: { display: false },
        ticks: { color: chrome.mutedInk, font: { size: 12 } },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: chrome.surface,
        titleColor: chrome.primaryInk,
        bodyColor: chrome.primaryInk,
        borderColor: chrome.primaryInk,
        borderWidth: 2,
        callbacks: {
          label: (context) => formatCurrency(Number(context.raw)),
        },
      },
    },
  };
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-base">Gastos por pessoa</CardTitle>
    </CardHeader>
    <CardContent v-if="!data.length">
      <EmptyState :icon="Users" title="Sem despesas neste período" />
    </CardContent>
    <CardContent v-else class="h-72">
      <Bar :data="chartData" :options="chartOptions" />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import type { ChartData, ChartOptions } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { chartChrome, statusPalette } from '@/lib/chart-colors';
import { useChartMode } from '@/composables/useChartMode';
import type { CashflowPoint } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const props = defineProps<{ data: CashflowPoint[] }>();

const mode = useChartMode();

function monthLabel(value: string): string {
  const [year, month] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(year, month - 1, 1));
}

const chartData = computed<ChartData<'bar'>>(() => {
  const chrome = chartChrome[mode.value];
  const status = statusPalette[mode.value];
  return {
    labels: props.data.map((point) => monthLabel(point.month)),
    datasets: [
      {
        label: 'Receitas',
        data: props.data.map((point) => point.income),
        backgroundColor: status.good,
        borderColor: chrome.primaryInk,
        borderWidth: 2,
        borderRadius: 4,
        maxBarThickness: 28,
      },
      {
        label: 'Despesas',
        data: props.data.map((point) => point.expense),
        backgroundColor: status.critical,
        borderColor: chrome.primaryInk,
        borderWidth: 2,
        borderRadius: 4,
        maxBarThickness: 28,
      },
    ],
  };
});

const chartOptions = computed<ChartOptions<'bar'>>(() => {
  const chrome = chartChrome[mode.value];
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: chrome.mutedInk, font: { size: 12 } },
      },
      y: {
        grid: { color: chrome.gridline },
        ticks: {
          color: chrome.mutedInk,
          font: { size: 12 },
          callback: (value) => formatCurrency(Number(value)),
        },
      },
    },
    plugins: {
      legend: {
        labels: { color: chrome.secondaryInk, font: { size: 12, weight: 600 } },
      },
      tooltip: {
        backgroundColor: chrome.surface,
        titleColor: chrome.primaryInk,
        bodyColor: chrome.primaryInk,
        borderColor: chrome.primaryInk,
        borderWidth: 2,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatCurrency(Number(context.raw))}`,
        },
      },
    },
  };
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-base">Receitas x Despesas</CardTitle>
    </CardHeader>
    <CardContent class="h-72 pl-0">
      <Bar :data="chartData" :options="chartOptions" />
    </CardContent>
  </Card>
</template>

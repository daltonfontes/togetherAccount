<script setup lang="ts">
import { computed } from 'vue';
import { CreditCard, Home, PiggyBank, TrendingDown, TrendingUp, Wallet } from '@lucide/vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import EmptyState from '@/components/layout/EmptyState.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import StatCard from '@/components/dashboard/StatCard.vue';
import CashflowChart from '@/components/dashboard/CashflowChart.vue';
import CategoryBreakdownChart from '@/components/dashboard/CategoryBreakdownChart.vue';
import RecentTransactions from '@/components/dashboard/RecentTransactions.vue';
import GoalsWidget from '@/components/dashboard/GoalsWidget.vue';
import { useCurrentHousehold } from '@/composables/useCurrentHousehold';
import { useCashflow, useCategoryBreakdown, useDashboard } from '@/composables/useReports';
import { formatCurrency } from '@/lib/utils';

const { household, householdId, isLoading: loadingHousehold } = useCurrentHousehold();
const { data: dashboard, isLoading } = useDashboard(householdId);
const { data: cashflow } = useCashflow(householdId, 6);
const { data: categoryBreakdown } = useCategoryBreakdown(householdId);

const pageDescription = 'Resumo financeiro do mês atual';
const pageTitle = computed(() => `Olá${household.value ? `, ${household.value.name}` : ''}`);
</script>

<template>
  <EmptyState
    v-if="!loadingHousehold && !household"
    :icon="Home"
    title="Você ainda não tem uma casa"
    description="Crie uma casa para começar a organizar as finanças compartilhadas"
  />
  <div v-else>
    <PageHeader :title="pageTitle" :description="pageDescription" />

    <div v-if="isLoading || !dashboard" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Skeleton v-for="i in 4" :key="i" class="h-24" />
    </div>
    <div v-else class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard title="Saldo total" :value="formatCurrency(dashboard.totalBalance)" :icon="Wallet" />
      <StatCard
        title="Receitas do mês"
        :value="formatCurrency(dashboard.monthlyIncome)"
        :icon="TrendingUp"
        tone="success"
      />
      <StatCard
        title="Despesas do mês"
        :value="formatCurrency(dashboard.monthlyExpense)"
        :icon="TrendingDown"
        tone="destructive"
      />
      <StatCard title="Cartões ativos" :value="String(dashboard.creditCardsCount)" :icon="CreditCard" />
    </div>

    <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <CashflowChart :data="cashflow ?? []" />
      <CategoryBreakdownChart :data="categoryBreakdown ?? []" />
    </div>

    <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <RecentTransactions :transactions="dashboard?.recentTransactions ?? []" />
      <GoalsWidget :goals="dashboard?.goals ?? []" />
    </div>

    <div v-if="dashboard && dashboard.activeGoalsCount === 0 && dashboard.accountsCount === 0" class="mt-6">
      <EmptyState
        :icon="PiggyBank"
        title="Vamos começar!"
        description="Cadastre uma conta bancária ou cartão de crédito para começar a registrar transações"
      />
    </div>
  </div>
</template>

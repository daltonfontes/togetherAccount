<script setup lang="ts">
import PageHeader from '@/components/layout/PageHeader.vue';
import CashflowChart from '@/components/dashboard/CashflowChart.vue';
import CategoryBreakdownChart from '@/components/dashboard/CategoryBreakdownChart.vue';
import MemberSpendingChart from '@/components/reports/MemberSpendingChart.vue';
import { useCurrentHousehold } from '@/composables/useCurrentHousehold';
import { useCashflow, useCategoryBreakdown, useMemberSpending } from '@/composables/useReports';

const { householdId } = useCurrentHousehold();
const { data: cashflow } = useCashflow(householdId, 12);
const { data: byCategory } = useCategoryBreakdown(householdId);
const { data: memberSpending } = useMemberSpending(householdId);
</script>

<template>
  <div>
    <PageHeader title="Relatórios" description="Análises financeiras detalhadas da casa" />

    <div class="grid grid-cols-1 gap-4">
      <CashflowChart :data="cashflow ?? []" />
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategoryBreakdownChart :data="byCategory ?? []" />
        <MemberSpendingChart :data="memberSpending ?? []" />
      </div>
    </div>
  </div>
</template>

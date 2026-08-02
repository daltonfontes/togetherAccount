'use client';

import { PageHeader } from '@/components/layout/page-header';
import { CashflowChart } from '@/components/dashboard/cashflow-chart';
import { CategoryBreakdownChart } from '@/components/dashboard/category-breakdown-chart';
import { MemberSpendingChart } from '@/components/reports/member-spending-chart';
import { useCurrentHousehold } from '@/lib/hooks/use-current-household';
import { useCashflow, useCategoryBreakdown, useMemberSpending } from '@/lib/hooks/use-reports';

export default function ReportsPage() {
  const { householdId } = useCurrentHousehold();
  const { data: cashflow } = useCashflow(householdId, 12);
  const { data: byCategory } = useCategoryBreakdown(householdId);
  const { data: memberSpending } = useMemberSpending(householdId);

  return (
    <div>
      <PageHeader title="Relatórios" description="Análises financeiras detalhadas da casa" />

      <div className="grid grid-cols-1 gap-4">
        <CashflowChart data={cashflow ?? []} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CategoryBreakdownChart data={byCategory ?? []} />
          <MemberSpendingChart data={memberSpending ?? []} />
        </div>
      </div>
    </div>
  );
}

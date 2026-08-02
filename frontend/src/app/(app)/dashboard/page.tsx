'use client';

import { CreditCard, Home, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/dashboard/stat-card';
import { CashflowChart } from '@/components/dashboard/cashflow-chart';
import { CategoryBreakdownChart } from '@/components/dashboard/category-breakdown-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { GoalsWidget } from '@/components/dashboard/goals-widget';
import { EmptyState } from '@/components/layout/empty-state';
import { useCurrentHousehold } from '@/lib/hooks/use-current-household';
import { useCashflow, useCategoryBreakdown, useDashboard } from '@/lib/hooks/use-reports';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { household, householdId, isLoading: loadingHousehold } = useCurrentHousehold();
  const { data: dashboard, isLoading } = useDashboard(householdId);
  const { data: cashflow } = useCashflow(householdId, 6);
  const { data: categoryBreakdown } = useCategoryBreakdown(householdId);

  if (!loadingHousehold && !household) {
    return (
      <EmptyState
        icon={Home}
        title="Você ainda não tem uma casa"
        description="Crie uma casa para começar a organizar as finanças compartilhadas"
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={`Olá${household ? `, ${household.name}` : ''}`}
        description="Resumo financeiro do mês atual"
      />

      {isLoading || !dashboard ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard title="Saldo total" value={formatCurrency(dashboard.totalBalance)} icon={Wallet} />
          <StatCard
            title="Receitas do mês"
            value={formatCurrency(dashboard.monthlyIncome)}
            icon={TrendingUp}
            tone="success"
          />
          <StatCard
            title="Despesas do mês"
            value={formatCurrency(dashboard.monthlyExpense)}
            icon={TrendingDown}
            tone="destructive"
          />
          <StatCard title="Cartões ativos" value={String(dashboard.creditCardsCount)} icon={CreditCard} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CashflowChart data={cashflow ?? []} />
        <CategoryBreakdownChart data={categoryBreakdown ?? []} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentTransactions transactions={dashboard?.recentTransactions ?? []} />
        <GoalsWidget goals={dashboard?.goals ?? []} />
      </div>

      {dashboard && dashboard.activeGoalsCount === 0 && dashboard.accountsCount === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={PiggyBank}
            title="Vamos começar!"
            description="Cadastre uma conta bancária ou cartão de crédito para começar a registrar transações"
          />
        </div>
      )}
    </div>
  );
}

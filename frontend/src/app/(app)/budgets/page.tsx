'use client';

import * as React from 'react';
import { PiggyBank, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/layout/empty-state';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { BudgetCard } from '@/components/budgets/budget-card';
import { BudgetFormDialog } from '@/components/budgets/budget-form-dialog';
import { useBudgets } from '@/lib/hooks/use-budgets';
import { useCurrentHousehold } from '@/lib/hooks/use-current-household';

export default function BudgetsPage() {
  const { householdId } = useCurrentHousehold();
  const [open, setOpen] = React.useState(false);
  const now = new Date();
  const { data: budgets, isLoading } = useBudgets(householdId, now.getMonth() + 1, now.getFullYear());

  return (
    <div>
      <PageHeader
        title="Orçamentos"
        description="Defina limites de gastos por categoria"
        actions={
          <Button onClick={() => setOpen(true)} disabled={!householdId}>
            <Plus className="h-4 w-4" />
            Novo orçamento
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : budgets && budgets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {budgets.map((item) => (
            <BudgetCard key={item.budget.id} householdId={householdId!} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState icon={PiggyBank} title="Nenhum orçamento definido" description="Crie orçamentos mensais para controlar seus gastos" />
      )}

      {householdId && <BudgetFormDialog householdId={householdId} open={open} onOpenChange={setOpen} />}
    </div>
  );
}

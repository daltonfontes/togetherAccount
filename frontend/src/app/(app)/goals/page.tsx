'use client';

import * as React from 'react';
import { Plus, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/layout/empty-state';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ContributionDialog } from '@/components/goals/contribution-dialog';
import { GoalCard } from '@/components/goals/goal-card';
import { GoalFormDialog } from '@/components/goals/goal-form-dialog';
import { useCurrentHousehold } from '@/lib/hooks/use-current-household';
import { useGoals } from '@/lib/hooks/use-goals';

export default function GoalsPage() {
  const { householdId } = useCurrentHousehold();
  const [open, setOpen] = React.useState(false);
  const [contributeGoalId, setContributeGoalId] = React.useState<string | null>(null);
  const { data: goals, isLoading } = useGoals(householdId);

  return (
    <div>
      <PageHeader
        title="Metas financeiras"
        description="Economize junto para os objetivos da casa"
        actions={
          <Button onClick={() => setOpen(true)} disabled={!householdId}>
            <Plus className="h-4 w-4" />
            Nova meta
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              householdId={householdId!}
              goal={goal}
              onContribute={setContributeGoalId}
            />
          ))}
        </div>
      ) : (
        <EmptyState icon={Target} title="Nenhuma meta cadastrada" description="Crie metas para economizar em conjunto" />
      )}

      {householdId && (
        <>
          <GoalFormDialog householdId={householdId} open={open} onOpenChange={setOpen} />
          <ContributionDialog
            householdId={householdId}
            goalId={contributeGoalId}
            open={!!contributeGoalId}
            onOpenChange={(value) => !value && setContributeGoalId(null)}
          />
        </>
      )}
    </div>
  );
}

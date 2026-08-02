'use client';

import { PlusCircle, Target, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDeleteGoal } from '@/lib/hooks/use-goals';
import { GoalStatus, type Goal } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export function GoalCard({
  householdId,
  goal,
  onContribute,
}: {
  householdId: string;
  goal: Goal;
  onContribute: (goalId: string) => void;
}) {
  const deleteGoal = useDeleteGoal(householdId);
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border text-white"
              style={{ backgroundColor: goal.color }}
            >
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{goal.name}</p>
              {goal.deadline && (
                <p className="text-xs text-muted-foreground">Prazo: {formatDate(goal.deadline)}</p>
              )}
            </div>
          </div>
          {goal.status === GoalStatus.COMPLETED && <Badge variant="success">Concluída</Badge>}
        </div>

        <div className="space-y-1.5">
          <Progress value={Math.min(progress, 100)} />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatCurrency(goal.currentAmount)}</span>
            <span>{formatCurrency(goal.targetAmount)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onContribute(goal.id)}>
            <PlusCircle className="h-4 w-4" />
            Contribuir
          </Button>
          <Button variant="ghost" size="icon" aria-label="Excluir meta" onClick={() => deleteGoal.mutate(goal.id)}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

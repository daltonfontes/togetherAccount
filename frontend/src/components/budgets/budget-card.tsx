'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDeleteBudget } from '@/lib/hooks/use-budgets';
import type { BudgetProgress } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';

export function BudgetCard({ householdId, item }: { householdId: string; item: BudgetProgress }) {
  const deleteBudget = useDeleteBudget(householdId);

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.budget.category?.color }}
            />
            <p className="font-medium">{item.budget.category?.name}</p>
            {item.isExceeded && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> Estourado
              </Badge>
            )}
            {item.isNearLimit && !item.isExceeded && <Badge variant="secondary">Quase no limite</Badge>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Excluir orçamento"
            onClick={() => deleteBudget.mutate(item.budget.id)}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        <Progress
          value={Math.min(item.percentageUsed, 100)}
          indicatorClassName={cn(item.isExceeded && 'bg-destructive')}
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatCurrency(item.spent)} gastos</span>
          <span>{formatCurrency(item.budget.limitAmount)} limite</span>
        </div>
      </CardContent>
    </Card>
  );
}

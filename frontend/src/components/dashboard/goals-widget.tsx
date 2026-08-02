import Link from 'next/link';
import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/layout/empty-state';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';

interface DashboardGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
}

export function GoalsWidget({ goals }: { goals: DashboardGoal[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Metas em andamento</CardTitle>
        <Link href="/goals" className="text-xs font-medium text-primary hover:underline">
          Ver todas
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 ? (
          <EmptyState icon={Target} title="Nenhuma meta ativa" description="Crie uma meta financeira para começar" />
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{goal.name}</span>
                <span className="text-muted-foreground">
                  {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                </span>
              </div>
              <Progress value={Math.min(goal.progress, 100)} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

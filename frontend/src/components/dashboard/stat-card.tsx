import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StatCard({
  title,
  value,
  icon: Icon,
  tone = 'default',
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  tone?: 'default' | 'success' | 'destructive';
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p
            className={cn(
              'text-2xl font-semibold tabular-nums',
              tone === 'success' && 'text-success',
              tone === 'destructive' && 'text-destructive',
            )}
          >
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

import type { LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-10 text-center">
      <Icon className="h-8 w-8 text-muted-foreground" />
      <div>
        <p className="font-bold">{title}</p>
        {description && <p className="text-sm font-medium text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

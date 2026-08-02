import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'flex min-h-16 w-full rounded-md border-2 border-input bg-card px-3 py-2 text-sm font-medium shadow-brutal-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:shadow-brutal focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea };

'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-2 group-[.toaster]:border-border group-[.toaster]:shadow-brutal group-[.toaster]:rounded-lg group-[.toaster]:font-semibold',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:border-2 group-[.toast]:border-border group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-bold',
          cancelButton:
            'group-[.toast]:border-2 group-[.toast]:border-border group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-bold',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

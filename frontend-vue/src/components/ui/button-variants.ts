import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'border-2 border-border bg-primary text-primary-foreground shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-1 active:translate-y-1',
        destructive:
          'border-2 border-border bg-destructive text-destructive-foreground shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-1 active:translate-y-1',
        outline:
          'border-2 border-border bg-background shadow-brutal hover:bg-secondary hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-1 active:translate-y-1',
        secondary:
          'border-2 border-border bg-secondary text-secondary-foreground shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-1 active:translate-y-1',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

import { cva, type VariantProps } from 'class-variance-authority';

export const sheetVariants = cva('fixed z-50 gap-4 bg-card p-6 transition ease-in-out', {
  variants: {
    side: {
      top: 'inset-x-0 top-0 border-b-2 border-border',
      bottom: 'inset-x-0 bottom-0 border-t-2 border-border',
      left: 'inset-y-0 left-0 h-full w-3/4 border-r-2 border-border sm:max-w-sm',
      right: 'inset-y-0 right-0 h-full w-3/4 border-l-2 border-border sm:max-w-sm',
    },
  },
  defaultVariants: { side: 'right' },
});

export type SheetVariants = VariantProps<typeof sheetVariants>;

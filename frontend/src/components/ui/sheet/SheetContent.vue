<script setup lang="ts">
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, type DialogContentProps } from 'reka-ui';
import { X } from '@lucide/vue';
import { cn } from '@/lib/utils';
import { sheetVariants, type SheetVariants } from './sheet-variants';

interface Props extends DialogContentProps {
  side?: SheetVariants['side'];
  class?: string;
}

const props = withDefaults(defineProps<Props>(), { side: 'left' });
</script>

<template>
  <DialogPortal>
    <DialogOverlay class="fixed inset-0 z-50 bg-black/70" />
    <DialogContent v-bind="props" :class="cn('!pointer-events-auto', sheetVariants({ side: props.side }), props.class)">
      <slot />
      <DialogClose
        class="absolute right-4 top-4 rounded-md border-2 border-border bg-secondary p-1 opacity-100 shadow-brutal-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Fechar</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>

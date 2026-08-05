<script setup lang="ts">
import { DialogClose, DialogContent, DialogPortal, type DialogContentProps } from 'reka-ui';
import { X } from '@lucide/vue';
import { cn } from '@/lib/utils';
import StyledDialogOverlay from './DialogOverlay.vue';

const props = defineProps<DialogContentProps & { class?: string }>();
</script>

<template>
  <DialogPortal>
    <StyledDialogOverlay />
    <DialogContent
      v-bind="props"
      :class="
        cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border-2 border-border bg-card p-6 shadow-brutal-lg max-h-[90vh] overflow-y-auto sm:rounded-lg',
          props.class,
        )
      "
    >
      <slot />
      <DialogClose
        class="absolute right-4 top-4 rounded-md border-2 border-border bg-secondary p-1 opacity-100 shadow-brutal-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Fechar</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>

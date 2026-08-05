<script setup lang="ts">
import { DropdownMenuContent, DropdownMenuPortal, type DropdownMenuContentProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = withDefaults(defineProps<DropdownMenuContentProps & { class?: string }>(), {
  sideOffset: 4,
  align: 'end',
});
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      v-bind="props"
      :class="
        cn(
          'z-50 min-w-40 overflow-hidden rounded-md border-2 border-border bg-popover p-1 text-popover-foreground shadow-brutal',
          props.class,
        )
      "
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>

<script setup lang="ts">
import { SelectIcon, SelectTrigger, type SelectTriggerProps } from 'reka-ui';
import { ChevronDown } from '@lucide/vue';
import { cn } from '@/lib/utils';

const props = defineProps<SelectTriggerProps & { class?: string }>();
</script>

<template>
  <SelectTrigger
    v-bind="props"
    :class="
      cn(
        'flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border-2 border-input bg-card px-3 py-2 text-sm font-semibold shadow-brutal-sm transition-all focus:outline-none focus:shadow-brutal focus:-translate-x-0.5 focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        props.class,
      )
    "
  >
    <slot />
    <SelectIcon as-child>
      <ChevronDown class="h-4 w-4 opacity-50" />
    </SelectIcon>
  </SelectTrigger>
</template>

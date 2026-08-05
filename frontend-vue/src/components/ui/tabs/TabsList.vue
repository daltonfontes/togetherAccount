<script setup lang="ts">
import { TabsList, type TabsListProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<TabsListProps & { class?: string }>();
</script>

<template>
  <TabsList
    v-bind="props"
    :class="
      cn(
        'inline-flex h-11 items-center justify-center rounded-lg border-2 border-border bg-muted p-1 text-muted-foreground shadow-brutal-sm',
        props.class,
      )
    "
  >
    <slot />
  </TabsList>
</template>

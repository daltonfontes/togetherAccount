<script setup lang="ts">
import { cn } from '@/lib/utils';

const props = defineProps<{ class?: string }>();
</script>

<template>
  <th
    :class="
      cn(
        'h-11 px-2 text-left align-middle text-xs font-extrabold uppercase tracking-wide text-muted-foreground [&:has([role=checkbox])]:pr-0',
        props.class,
      )
    "
  >
    <slot />
  </th>
</template>

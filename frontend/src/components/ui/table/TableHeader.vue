<script setup lang="ts">
import { cn } from '@/lib/utils';

const props = defineProps<{ class?: string }>();
</script>

<template>
  <thead :class="cn('[&_tr]:border-b-2 [&_tr]:border-border', props.class)">
    <slot />
  </thead>
</template>

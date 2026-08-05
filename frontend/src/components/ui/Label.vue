<script setup lang="ts">
import { Label as LabelPrimitive } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<{ class?: string; for?: string }>();
</script>

<template>
  <LabelPrimitive
    :for="props.for"
    :class="cn('text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', props.class)"
  >
    <slot />
  </LabelPrimitive>
</template>

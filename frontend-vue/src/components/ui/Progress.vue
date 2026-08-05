<script setup lang="ts">
import { ProgressIndicator, ProgressRoot, type ProgressRootProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<ProgressRootProps & { class?: string; indicatorClass?: string }>();
</script>

<template>
  <ProgressRoot
    v-bind="props"
    :class="cn('relative h-3.5 w-full overflow-hidden rounded-full border-2 border-border bg-muted', props.class)"
  >
    <ProgressIndicator
      :class="cn('h-full w-full flex-1 bg-primary transition-all', props.indicatorClass)"
      :style="{ transform: `translateX(-${100 - (props.modelValue || 0)}%)` }"
    />
  </ProgressRoot>
</template>

<script setup lang="ts">
import { AvatarFallback, type AvatarFallbackProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<AvatarFallbackProps & { class?: string }>();
</script>

<template>
  <AvatarFallback
    v-bind="props"
    :class="cn('flex h-full w-full items-center justify-center rounded-full bg-secondary text-xs font-extrabold', props.class)"
  >
    <slot />
  </AvatarFallback>
</template>

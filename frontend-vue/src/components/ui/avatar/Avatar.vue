<script setup lang="ts">
import { AvatarRoot, type AvatarRootProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<AvatarRootProps & { class?: string }>();
</script>

<template>
  <AvatarRoot
    v-bind="props"
    :class="cn('relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-border', props.class)"
  >
    <slot />
  </AvatarRoot>
</template>

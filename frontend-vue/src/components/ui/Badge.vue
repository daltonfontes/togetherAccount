<script setup lang="ts">
import { cn } from '@/lib/utils';
import { badgeVariants, type BadgeVariants } from './badge-variants';

interface Props {
  variant?: BadgeVariants['variant'];
  class?: string;
}

const props = withDefaults(defineProps<Props>(), { variant: 'default' });
</script>

<template>
  <div :class="cn(badgeVariants({ variant: props.variant }), props.class)">
    <slot />
  </div>
</template>

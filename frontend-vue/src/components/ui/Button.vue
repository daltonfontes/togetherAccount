<script setup lang="ts">
import type { Component } from 'vue';
import { Primitive } from 'reka-ui';
import { cn } from '@/lib/utils';
import { buttonVariants, type ButtonVariants } from './button-variants';

interface Props {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  asChild?: boolean;
  as?: string | Component;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  asChild: false,
  as: 'button',
});
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <slot />
  </Primitive>
</template>

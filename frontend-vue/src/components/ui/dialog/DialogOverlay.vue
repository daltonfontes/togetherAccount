<script setup lang="ts">
import { DialogOverlay, type DialogOverlayProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<DialogOverlayProps & { class?: string }>();
</script>

<template>
  <DialogOverlay v-bind="props" :class="cn('fixed inset-0 z-50 bg-black/70', props.class)" />
</template>

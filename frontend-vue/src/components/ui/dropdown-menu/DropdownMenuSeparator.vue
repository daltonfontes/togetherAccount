<script setup lang="ts">
import { DropdownMenuSeparator, type DropdownMenuSeparatorProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<DropdownMenuSeparatorProps & { class?: string }>();
</script>

<template>
  <DropdownMenuSeparator v-bind="props" :class="cn('-mx-1 my-1 h-0.5 bg-border', props.class)" />
</template>

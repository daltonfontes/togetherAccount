<script setup lang="ts">
import { cn } from '@/lib/utils';

const props = defineProps<{ class?: string; message?: string }>();
</script>

<template>
  <p v-if="message" :class="cn('text-xs font-medium text-destructive', props.class)">
    {{ message }}
  </p>
</template>

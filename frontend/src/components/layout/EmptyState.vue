<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{ icon: Component; title: string; description?: string }>();
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-10 text-center">
    <component :is="icon" class="h-8 w-8 text-muted-foreground" />
    <div>
      <p class="font-bold">{{ title }}</p>
      <p v-if="description" class="text-sm font-medium text-muted-foreground">{{ description }}</p>
    </div>
    <slot name="action" />
  </div>
</template>

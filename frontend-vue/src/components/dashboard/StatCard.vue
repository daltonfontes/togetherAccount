<script setup lang="ts">
import type { Component } from 'vue';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

withDefaults(
  defineProps<{
    title: string;
    value: string;
    icon: Component;
    tone?: 'default' | 'success' | 'destructive';
  }>(),
  { tone: 'default' },
);
</script>

<template>
  <Card>
    <CardContent class="flex items-center justify-between p-5">
      <div class="space-y-1">
        <p class="text-sm font-bold text-muted-foreground">{{ title }}</p>
        <p
          :class="
            cn(
              'text-2xl font-extrabold tabular-nums',
              tone === 'success' && 'text-success',
              tone === 'destructive' && 'text-destructive',
            )
          "
        >
          {{ value }}
        </p>
      </div>
      <div class="flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-accent text-accent-foreground">
        <component :is="icon" class="h-5 w-5" />
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { cn } from '@/lib/utils';
import { navItems } from './nav-items';

defineProps<{ onNavigate?: () => void }>();

const route = useRoute();
</script>

<template>
  <nav class="flex flex-col gap-1">
    <RouterLink
      v-for="item in navItems"
      :key="item.href"
      :to="item.href"
      :class="
        cn(
          'flex items-center gap-3 rounded-md border-2 px-3 py-2 text-sm font-bold transition-all',
          route.path.startsWith(item.href)
            ? 'border-border bg-primary text-primary-foreground shadow-brutal-sm'
            : 'border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground',
        )
      "
      @click="onNavigate?.()"
    >
      <component :is="item.icon" class="h-4 w-4" />
      {{ item.title }}
    </RouterLink>
  </nav>
</template>

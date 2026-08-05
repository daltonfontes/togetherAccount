<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { Wallet2 } from '@lucide/vue';
import ThemeToggle from '@/components/layout/ThemeToggle.vue';
</script>

<template>
  <div class="flex min-h-screen flex-col bg-muted/30">
    <header class="flex items-center justify-between p-4">
      <RouterLink to="/" class="flex items-center gap-2 font-semibold">
        <Wallet2 class="h-6 w-6 text-primary" />
        <span>Together Account</span>
      </RouterLink>
      <ThemeToggle />
    </header>
    <main class="flex flex-1 items-center justify-center p-4">
      <div class="w-full max-w-md">
        <RouterView />
      </div>
    </main>
  </div>
</template>

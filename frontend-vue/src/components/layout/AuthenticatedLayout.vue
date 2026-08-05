<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppHeader />
    <div class="flex">
      <AppSidebar />
      <main class="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
import Toaster from '@/components/ui/Toaster.vue';

const isDev = import.meta.env.DEV;
</script>

<template>
  <RouterView />
  <Toaster rich-colors position="top-right" />
  <VueQueryDevtools v-if="isDev" :initial-is-open="false" />
</template>

<script setup lang="ts">
import { Toaster as Sonner } from 'vue-sonner';
import { useTheme } from '@/composables/useTheme';

const { theme } = useTheme();
</script>

<template>
  <Sonner
    :theme="theme"
    class="toaster group"
    :toast-options="{
      classes: {
        toast:
          'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-2 group-[.toaster]:border-border group-[.toaster]:shadow-brutal group-[.toaster]:rounded-lg group-[.toaster]:font-semibold',
        description: 'group-[.toast]:text-muted-foreground',
        actionButton:
          'group-[.toast]:border-2 group-[.toast]:border-border group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-bold',
        cancelButton:
          'group-[.toast]:border-2 group-[.toast]:border-border group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-bold',
      },
    }"
  />
</template>

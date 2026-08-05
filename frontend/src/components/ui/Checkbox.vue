<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot, type CheckboxRootProps } from 'reka-ui';
import { Check } from '@lucide/vue';
import { cn } from '@/lib/utils';

const props = defineProps<CheckboxRootProps & { class?: string }>();
</script>

<template>
  <CheckboxRoot
    v-bind="props"
    :class="
      cn(
        'peer h-5 w-5 shrink-0 rounded-sm border-2 border-border bg-card shadow-brutal-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        props.class,
      )
    "
  >
    <CheckboxIndicator class="flex items-center justify-center text-current">
      <Check class="h-3.5 w-3.5" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>

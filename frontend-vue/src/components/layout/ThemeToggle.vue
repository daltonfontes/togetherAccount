<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue';
import Button from '@/components/ui/Button.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/composables/useTheme';

const { setTheme } = useTheme();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" aria-label="Alternar tema">
        <Sun class="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon class="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @select="setTheme('light')">Claro</DropdownMenuItem>
      <DropdownMenuItem @select="setTheme('dark')">Escuro</DropdownMenuItem>
      <DropdownMenuItem @select="setTheme('system')">Sistema</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

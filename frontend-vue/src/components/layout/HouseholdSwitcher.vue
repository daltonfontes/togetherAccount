<script setup lang="ts">
import { ref } from 'vue';
import { Check, ChevronsUpDown, Plus } from '@lucide/vue';
import Button from '@/components/ui/Button.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreateHouseholdDialog from '@/components/household/CreateHouseholdDialog.vue';
import { useCurrentHousehold } from '@/composables/useCurrentHousehold';

const { households, household, setCurrentHouseholdId } = useCurrentHousehold();
const createOpen = ref(false);
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" class="w-full justify-between sm:w-56">
        <span class="truncate">{{ household?.name ?? 'Selecione uma casa' }}</span>
        <ChevronsUpDown class="h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" class="w-56">
      <DropdownMenuItem v-for="h in households" :key="h.id" @select="setCurrentHouseholdId(h.id)">
        <Check :class="['mr-2 h-4 w-4', h.id === household?.id ? 'opacity-100' : 'opacity-0']" />
        <span class="truncate">{{ h.name }}</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @select="createOpen = true">
        <Plus class="mr-2 h-4 w-4" />
        Nova casa
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  <CreateHouseholdDialog v-model:open="createOpen" />
</template>

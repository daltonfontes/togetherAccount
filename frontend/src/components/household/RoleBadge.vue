<script setup lang="ts">
import Badge from '@/components/ui/Badge.vue';
import { HouseholdRole } from '@/lib/types';

const labels: Record<HouseholdRole, string> = {
  [HouseholdRole.OWNER]: 'Dono(a)',
  [HouseholdRole.ADMIN]: 'Admin',
  [HouseholdRole.MEMBER]: 'Membro',
};

const props = defineProps<{ role: HouseholdRole }>();
</script>

<template>
  <Badge :variant="role === HouseholdRole.OWNER ? 'default' : 'secondary'">{{ labels[props.role] }}</Badge>
</template>

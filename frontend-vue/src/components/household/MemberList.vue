<script setup lang="ts">
import { Trash2 } from '@lucide/vue';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Button from '@/components/ui/Button.vue';
import RoleBadge from '@/components/household/RoleBadge.vue';
import { useCurrentUser } from '@/composables/useAuth';
import { useHouseholdMembers, useRemoveMember } from '@/composables/useHouseholds';
import { getInitials } from '@/lib/utils';

const props = defineProps<{ householdId: string; ownerId: string }>();

const { data: members } = useHouseholdMembers(props.householdId);
const removeMember = useRemoveMember(props.householdId);
const currentUser = useCurrentUser();
</script>

<template>
  <ul class="divide-y">
    <li v-for="member in members" :key="member.id" class="flex items-center justify-between py-3">
      <div class="flex items-center gap-3">
        <Avatar>
          <AvatarImage v-if="member.user.avatarUrl" :src="member.user.avatarUrl" :alt="member.user.fullName" />
          <AvatarFallback>{{ getInitials(member.user.fullName) }}</AvatarFallback>
        </Avatar>
        <div>
          <p class="text-sm font-medium">{{ member.user.fullName }}</p>
          <p class="text-xs text-muted-foreground">{{ member.user.email }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <RoleBadge :role="member.role" />
        <Button
          v-if="member.userId !== ownerId && member.userId !== currentUser?.id"
          variant="ghost"
          size="icon"
          aria-label="Remover morador"
          @click="removeMember.mutate(member.id)"
        >
          <Trash2 class="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </li>
  </ul>
</template>

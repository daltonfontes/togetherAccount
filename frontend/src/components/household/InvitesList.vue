<script setup lang="ts">
import { Mail, X } from '@lucide/vue';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';
import EmptyState from '@/components/layout/EmptyState.vue';
import { useHouseholdInvites, useRevokeInvite } from '@/composables/useInvites';
import { InviteStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const statusLabel: Record<InviteStatus, string> = {
  [InviteStatus.PENDING]: 'Pendente',
  [InviteStatus.ACCEPTED]: 'Aceito',
  [InviteStatus.DECLINED]: 'Recusado',
  [InviteStatus.EXPIRED]: 'Expirado',
  [InviteStatus.REVOKED]: 'Revogado',
};

const props = defineProps<{ householdId: string }>();

const { data: invites } = useHouseholdInvites(props.householdId);
const revokeInvite = useRevokeInvite(props.householdId);
</script>

<template>
  <EmptyState v-if="!invites || invites.length === 0" :icon="Mail" title="Nenhum convite enviado" />
  <ul v-else class="divide-y">
    <li v-for="invite in invites" :key="invite.id" class="flex items-center justify-between py-3">
      <div>
        <p class="text-sm font-medium">{{ invite.email }}</p>
        <p class="text-xs text-muted-foreground">Enviado em {{ formatDate(invite.createdAt) }}</p>
      </div>
      <div class="flex items-center gap-2">
        <Badge :variant="invite.status === InviteStatus.PENDING ? 'secondary' : 'outline'">
          {{ statusLabel[invite.status] }}
        </Badge>
        <Button
          v-if="invite.status === InviteStatus.PENDING"
          variant="ghost"
          size="icon"
          aria-label="Revogar convite"
          @click="revokeInvite.mutate(invite.id)"
        >
          <X class="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </li>
  </ul>
</template>

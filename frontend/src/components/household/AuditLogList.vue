<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { History } from '@lucide/vue';
import Badge from '@/components/ui/Badge.vue';
import EmptyState from '@/components/layout/EmptyState.vue';
import { householdsApi } from '@/lib/api/households';
import { formatDate } from '@/lib/utils';

const actionLabel: Record<string, string> = {
  create: 'Criou',
  update: 'Atualizou',
  delete: 'Excluiu',
  login: 'Entrou',
  logout: 'Saiu',
  invite: 'Convidou',
  accept_invite: 'Aceitou convite',
  remove_member: 'Removeu morador',
};

const props = defineProps<{ householdId: string }>();

const { data } = useQuery({
  queryKey: ['households', props.householdId, 'audit-logs'],
  queryFn: () => householdsApi.auditLogs(props.householdId, 1, 30),
});
</script>

<template>
  <EmptyState v-if="!data?.items.length" :icon="History" title="Nenhum registro de auditoria ainda" />
  <ul v-else class="divide-y">
    <li v-for="log in data.items" :key="log.id" class="flex items-center justify-between py-3 text-sm">
      <div class="flex items-center gap-2">
        <Badge variant="outline">{{ actionLabel[log.action] ?? log.action }}</Badge>
        <span>{{ log.user?.fullName ?? 'Sistema' }} • {{ log.entityType }}</span>
      </div>
      <span class="text-xs text-muted-foreground">
        {{ formatDate(log.createdAt, { dateStyle: 'short', timeStyle: 'short' }) }}
      </span>
    </li>
  </ul>
</template>

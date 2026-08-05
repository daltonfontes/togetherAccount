<script setup lang="ts">
import { computed } from 'vue';
import { Bell, Check, Trash2 } from '@lucide/vue';
import Button from '@/components/ui/Button.vue';
import { Card, CardContent } from '@/components/ui/card';
import EmptyState from '@/components/layout/EmptyState.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/composables/useNotifications';
import { cn, formatDate } from '@/lib/utils';

const { data, isLoading } = useNotifications(1, 50);
const markAsRead = useMarkNotificationRead();
const markAllAsRead = useMarkAllNotificationsRead();
const removeNotification = useDeleteNotification();

const notifications = computed(() => data.value?.items ?? []);
</script>

<template>
  <div>
    <PageHeader title="Notificações" description="Fique por dentro do que acontece na sua casa">
      <template #actions>
        <Button variant="outline" :disabled="notifications.length === 0" @click="markAllAsRead.mutate()">
          <Check class="h-4 w-4" />
          Marcar todas como lidas
        </Button>
      </template>
    </PageHeader>

    <Card>
      <CardContent class="pt-6">
        <div v-if="isLoading" class="space-y-2">
          <Skeleton v-for="i in 5" :key="i" class="h-14 w-full" />
        </div>
        <EmptyState v-else-if="notifications.length === 0" :icon="Bell" title="Nenhuma notificação" />
        <ul v-else class="divide-y">
          <li
            v-for="notification in notifications"
            :key="notification.id"
            :class="cn('flex items-start justify-between gap-4 py-3', !notification.isRead && 'bg-accent/40 -mx-4 px-4 rounded-md')"
          >
            <div>
              <p class="text-sm font-medium">{{ notification.title }}</p>
              <p class="text-sm text-muted-foreground">{{ notification.message }}</p>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ formatDate(notification.createdAt, { dateStyle: 'short', timeStyle: 'short' }) }}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-1">
              <Button
                v-if="!notification.isRead"
                variant="ghost"
                size="icon"
                aria-label="Marcar como lida"
                @click="markAsRead.mutate(notification.id)"
              >
                <Check class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Excluir notificação"
                @click="removeNotification.mutate(notification.id)"
              >
                <Trash2 class="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>

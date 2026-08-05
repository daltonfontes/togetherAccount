<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { Bell } from '@lucide/vue';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';
import { useUnreadCount } from '@/composables/useNotifications';

const { data } = useUnreadCount();
const count = computed(() => data.value?.count ?? 0);
</script>

<template>
  <Button variant="ghost" size="icon" class="relative" :as="RouterLink" to="/notifications" aria-label="Notificações">
    <Bell class="h-4 w-4" />
    <Badge
      v-if="count > 0"
      variant="destructive"
      class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]"
    >
      {{ count > 9 ? '9+' : count }}
    </Badge>
  </Button>
</template>

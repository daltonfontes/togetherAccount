<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { LogOut, Settings, User as UserIcon } from '@lucide/vue';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Button from '@/components/ui/Button.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentUser, useLogout } from '@/composables/useAuth';
import { getInitials } from '@/lib/utils';

const user = useCurrentUser();
const logout = useLogout();
</script>

<template>
  <DropdownMenu v-if="user">
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="relative h-9 w-9 rounded-full">
        <Avatar class="h-9 w-9">
          <AvatarImage v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.fullName" />
          <AvatarFallback>{{ getInitials(user.fullName) }}</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56">
      <DropdownMenuLabel class="flex flex-col">
        <span class="font-medium">{{ user.fullName }}</span>
        <span class="text-xs font-normal text-muted-foreground">{{ user.email }}</span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem as-child>
        <RouterLink to="/settings">
          <UserIcon class="mr-2 h-4 w-4" />
          Perfil
        </RouterLink>
      </DropdownMenuItem>
      <DropdownMenuItem as-child>
        <RouterLink to="/settings">
          <Settings class="mr-2 h-4 w-4" />
          Configurações
        </RouterLink>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @select="logout.mutate()">
        <LogOut class="mr-2 h-4 w-4" />
        Sair
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

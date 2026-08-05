<script setup lang="ts">
import { ref } from 'vue';
import { Menu, Wallet2 } from '@lucide/vue';
import Button from '@/components/ui/Button.vue';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import HouseholdSwitcher from '@/components/layout/HouseholdSwitcher.vue';
import NavLinks from '@/components/layout/NavLinks.vue';
import NotificationBell from '@/components/layout/NotificationBell.vue';
import ThemeToggle from '@/components/layout/ThemeToggle.vue';
import UserNav from '@/components/layout/UserNav.vue';

const open = ref(false);
</script>

<template>
  <header class="sticky top-0 z-40 flex h-16 items-center gap-3 border-b-2 border-border bg-background px-4">
    <Sheet v-model:open="open">
      <SheetTrigger as-child>
        <Button variant="ghost" size="icon" class="lg:hidden">
          <Menu class="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" class="w-64">
        <SheetHeader>
          <SheetTitle class="flex items-center gap-2">
            <Wallet2 class="h-5 w-5 text-primary" />
            Together Account
          </SheetTitle>
        </SheetHeader>
        <div class="mt-6">
          <NavLinks :on-navigate="() => (open = false)" />
        </div>
      </SheetContent>
    </Sheet>

    <div class="hidden items-center gap-2 font-extrabold lg:flex">
      <Wallet2 class="h-5 w-5 text-primary" />
      <span>Together Account</span>
    </div>

    <div class="flex-1">
      <HouseholdSwitcher />
    </div>

    <div class="flex items-center gap-1">
      <NotificationBell />
      <ThemeToggle />
      <UserNav />
    </div>
  </header>
</template>

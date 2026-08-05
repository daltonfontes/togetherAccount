<script setup lang="ts">
import { Landmark, Trash2 } from '@lucide/vue';
import Button from '@/components/ui/Button.vue';
import { Card, CardContent } from '@/components/ui/card';
import { useDeleteBankAccount } from '@/composables/useBankAccounts';
import type { BankAccount } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const props = defineProps<{ householdId: string; account: BankAccount }>();

const deleteAccount = useDeleteBankAccount(props.householdId);
</script>

<template>
  <Card>
    <CardContent class="flex items-center justify-between p-5">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border text-white"
          :style="{ backgroundColor: account.color }"
        >
          <Landmark class="h-5 w-5" />
        </div>
        <div>
          <p class="font-medium">{{ account.name }}</p>
          <p class="text-xs text-muted-foreground">{{ account.bank || account.owner?.fullName }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-semibold tabular-nums">{{ formatCurrency(account.balance) }}</span>
        <Button variant="ghost" size="icon" aria-label="Excluir conta" @click="deleteAccount.mutate(account.id)">
          <Trash2 class="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

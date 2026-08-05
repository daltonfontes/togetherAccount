<script setup lang="ts">
import { ref } from 'vue';
import { Landmark, Plus } from '@lucide/vue';
import Button from '@/components/ui/Button.vue';
import EmptyState from '@/components/layout/EmptyState.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import AccountCard from '@/components/accounts/AccountCard.vue';
import AccountFormDialog from '@/components/accounts/AccountFormDialog.vue';
import { useBankAccounts } from '@/composables/useBankAccounts';
import { useCurrentHousehold } from '@/composables/useCurrentHousehold';

const { householdId } = useCurrentHousehold();
const open = ref(false);
const { data: accounts, isLoading } = useBankAccounts(householdId);
</script>

<template>
  <div>
    <PageHeader title="Contas bancárias" description="Gerencie as contas da casa">
      <template #actions>
        <Button :disabled="!householdId" @click="open = true">
          <Plus class="h-4 w-4" />
          Nova conta
        </Button>
      </template>
    </PageHeader>

    <div v-if="isLoading" class="grid gap-4 sm:grid-cols-2">
      <Skeleton v-for="i in 4" :key="i" class="h-20" />
    </div>
    <div v-else-if="accounts && accounts.length > 0" class="grid gap-4 sm:grid-cols-2">
      <AccountCard v-for="account in accounts" :key="account.id" :household-id="householdId!" :account="account" />
    </div>
    <EmptyState v-else :icon="Landmark" title="Nenhuma conta cadastrada" description="Adicione uma conta bancária para começar" />

    <AccountFormDialog v-if="householdId" v-model:open="open" :household-id="householdId" />
  </div>
</template>

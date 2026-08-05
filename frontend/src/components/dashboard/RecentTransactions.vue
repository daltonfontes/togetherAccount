<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ArrowDownLeft, ArrowUpRight, Receipt } from '@lucide/vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyState from '@/components/layout/EmptyState.vue';
import { TransactionType, type Transaction } from '@/lib/types';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

defineProps<{ transactions: Transaction[] }>();
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between">
      <CardTitle class="text-base">Últimas transações</CardTitle>
      <RouterLink to="/transactions" class="text-xs font-medium text-primary hover:underline">
        Ver todas
      </RouterLink>
    </CardHeader>
    <CardContent>
      <EmptyState v-if="transactions.length === 0" :icon="Receipt" title="Nenhuma transação ainda" />
      <ul v-else class="divide-y">
        <li
          v-for="transaction in transactions"
          :key="transaction.id"
          class="flex items-center justify-between py-3"
        >
          <div class="flex items-center gap-3">
            <div
              :class="
                cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 border-border',
                  transaction.type === TransactionType.INCOME
                    ? 'bg-success/30 text-success-foreground'
                    : 'bg-destructive/30 text-destructive-foreground',
                )
              "
            >
              <ArrowUpRight v-if="transaction.type === TransactionType.INCOME" class="h-4 w-4" />
              <ArrowDownLeft v-else class="h-4 w-4" />
            </div>
            <div>
              <p class="text-sm font-medium">{{ transaction.description }}</p>
              <p class="text-xs text-muted-foreground">
                {{ transaction.category?.name }} • {{ formatDate(transaction.date) }}
              </p>
            </div>
          </div>
          <span
            :class="
              cn(
                'text-sm font-semibold tabular-nums',
                transaction.type === TransactionType.INCOME ? 'text-success' : 'text-destructive',
              )
            "
          >
            {{ transaction.type === TransactionType.INCOME ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
          </span>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>

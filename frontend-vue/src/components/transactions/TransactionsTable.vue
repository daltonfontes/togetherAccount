<script setup lang="ts">
import { Receipt, Trash2 } from '@lucide/vue';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';
import EmptyState from '@/components/layout/EmptyState.vue';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDeleteTransaction } from '@/composables/useTransactions';
import { TransactionType, type Transaction } from '@/lib/types';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

const props = defineProps<{ householdId: string; transactions: Transaction[] }>();

const deleteTransaction = useDeleteTransaction(props.householdId);
</script>

<template>
  <EmptyState v-if="transactions.length === 0" :icon="Receipt" title="Nenhuma transação encontrada" />
  <Table v-else>
    <TableHeader>
      <TableRow>
        <TableHead>Descrição</TableHead>
        <TableHead>Categoria</TableHead>
        <TableHead>Pago por</TableHead>
        <TableHead>Data</TableHead>
        <TableHead class="text-right">Valor</TableHead>
        <TableHead class="w-10" />
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="transaction in transactions" :key="transaction.id">
        <TableCell class="font-medium">
          {{ transaction.description }}
          <Badge v-if="transaction.isShared" variant="secondary" class="ml-2">Dividida</Badge>
          <Badge v-if="transaction.isRecurring" variant="outline" class="ml-2">Recorrente</Badge>
        </TableCell>
        <TableCell>
          <span class="inline-flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: transaction.category?.color }" />
            {{ transaction.category?.name }}
          </span>
        </TableCell>
        <TableCell>{{ transaction.payer?.fullName }}</TableCell>
        <TableCell>{{ formatDate(transaction.date) }}</TableCell>
        <TableCell
          :class="
            cn(
              'text-right font-semibold tabular-nums',
              transaction.type === TransactionType.INCOME ? 'text-success' : 'text-destructive',
            )
          "
        >
          {{ transaction.type === TransactionType.INCOME ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
        </TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Excluir transação"
            @click="deleteTransaction.mutate(transaction.id)"
          >
            <Trash2 class="h-4 w-4 text-muted-foreground" />
          </Button>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

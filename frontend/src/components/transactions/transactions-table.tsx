'use client';

import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/layout/empty-state';
import { Receipt } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDeleteTransaction } from '@/lib/hooks/use-transactions';
import { TransactionType, type Transaction } from '@/lib/types';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

export function TransactionsTable({
  householdId,
  transactions,
}: {
  householdId: string;
  transactions: Transaction[];
}) {
  const deleteTransaction = useDeleteTransaction(householdId);

  if (transactions.length === 0) {
    return <EmptyState icon={Receipt} title="Nenhuma transação encontrada" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Pago por</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => {
          const isIncome = transaction.type === TransactionType.INCOME;
          return (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {transaction.description}
                {transaction.isShared && (
                  <Badge variant="secondary" className="ml-2">
                    Dividida
                  </Badge>
                )}
                {transaction.isRecurring && (
                  <Badge variant="outline" className="ml-2">
                    Recorrente
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: transaction.category?.color }}
                  />
                  {transaction.category?.name}
                </span>
              </TableCell>
              <TableCell>{transaction.payer?.fullName}</TableCell>
              <TableCell>{formatDate(transaction.date)}</TableCell>
              <TableCell
                className={cn('text-right font-semibold tabular-nums', isIncome ? 'text-success' : 'text-destructive')}
              >
                {isIncome ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Excluir transação"
                  onClick={() => deleteTransaction.mutate(transaction.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

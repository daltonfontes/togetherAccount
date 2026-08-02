import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/layout/empty-state';
import { TransactionType, type Transaction } from '@/lib/types';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Últimas transações</CardTitle>
        <Link href="/transactions" className="text-xs font-medium text-primary hover:underline">
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <EmptyState icon={Receipt} title="Nenhuma transação ainda" />
        ) : (
          <ul className="divide-y">
            {transactions.map((transaction) => {
              const isIncome = transaction.type === TransactionType.INCOME;
              return (
                <li key={transaction.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full',
                        isIncome ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
                      )}
                    >
                      {isIncome ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category?.name} • {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-semibold tabular-nums',
                      isIncome ? 'text-success' : 'text-destructive',
                    )}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

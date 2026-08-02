'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionFormDialog } from '@/components/transactions/transaction-form-dialog';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import { useCurrentHousehold } from '@/lib/hooks/use-current-household';
import { useTransactions } from '@/lib/hooks/use-transactions';

export default function TransactionsPage() {
  const { householdId } = useCurrentHousehold();
  const [open, setOpen] = React.useState(false);
  const { data, isLoading } = useTransactions(householdId, { limit: 50 });

  return (
    <div>
      <PageHeader
        title="Transações"
        description="Receitas e despesas da casa"
        actions={
          <Button onClick={() => setOpen(true)} disabled={!householdId}>
            <Plus className="h-4 w-4" />
            Nova transação
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <TransactionsTable householdId={householdId ?? ''} transactions={data?.items ?? []} />
          )}
        </CardContent>
      </Card>

      {householdId && (
        <TransactionFormDialog householdId={householdId} open={open} onOpenChange={setOpen} />
      )}
    </div>
  );
}

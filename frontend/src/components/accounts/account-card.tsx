'use client';

import { Landmark, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDeleteBankAccount } from '@/lib/hooks/use-bank-accounts';
import type { BankAccount } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export function AccountCard({ householdId, account }: { householdId: string; account: BankAccount }) {
  const deleteAccount = useDeleteBankAccount(householdId);

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: account.color }}
          >
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">{account.name}</p>
            <p className="text-xs text-muted-foreground">{account.bank || account.owner?.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold tabular-nums">{formatCurrency(account.balance)}</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Excluir conta"
            onClick={() => deleteAccount.mutate(account.id)}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

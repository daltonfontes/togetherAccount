'use client';

import * as React from 'react';
import { Landmark, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/layout/empty-state';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountCard } from '@/components/accounts/account-card';
import { AccountFormDialog } from '@/components/accounts/account-form-dialog';
import { useBankAccounts } from '@/lib/hooks/use-bank-accounts';
import { useCurrentHousehold } from '@/lib/hooks/use-current-household';

export default function AccountsPage() {
  const { householdId } = useCurrentHousehold();
  const [open, setOpen] = React.useState(false);
  const { data: accounts, isLoading } = useBankAccounts(householdId);

  return (
    <div>
      <PageHeader
        title="Contas bancárias"
        description="Gerencie as contas da casa"
        actions={
          <Button onClick={() => setOpen(true)} disabled={!householdId}>
            <Plus className="h-4 w-4" />
            Nova conta
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : accounts && accounts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {accounts.map((account) => (
            <AccountCard key={account.id} householdId={householdId!} account={account} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Landmark} title="Nenhuma conta cadastrada" description="Adicione uma conta bancária para começar" />
      )}

      {householdId && <AccountFormDialog householdId={householdId} open={open} onOpenChange={setOpen} />}
    </div>
  );
}

'use client';

import * as React from 'react';
import { CreditCard as CardIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/layout/empty-state';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCardFormDialog } from '@/components/credit-cards/credit-card-form-dialog';
import { CreditCardItem } from '@/components/credit-cards/credit-card-item';
import { useCreditCards } from '@/lib/hooks/use-credit-cards';
import { useCurrentHousehold } from '@/lib/hooks/use-current-household';

export default function CreditCardsPage() {
  const { householdId } = useCurrentHousehold();
  const [open, setOpen] = React.useState(false);
  const { data: cards, isLoading } = useCreditCards(householdId);

  return (
    <div>
      <PageHeader
        title="Cartões de crédito"
        description="Acompanhe faturas e limites"
        actions={
          <Button onClick={() => setOpen(true)} disabled={!householdId}>
            <Plus className="h-4 w-4" />
            Novo cartão
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : cards && cards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <CreditCardItem key={card.id} householdId={householdId!} card={card} />
          ))}
        </div>
      ) : (
        <EmptyState icon={CardIcon} title="Nenhum cartão cadastrado" description="Adicione um cartão para acompanhar faturas" />
      )}

      {householdId && <CreditCardFormDialog householdId={householdId} open={open} onOpenChange={setOpen} />}
    </div>
  );
}

'use client';

import { CreditCard as CardIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCreditCardInvoice, useDeleteCreditCard } from '@/lib/hooks/use-credit-cards';
import type { CreditCard } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export function CreditCardItem({ householdId, card }: { householdId: string; card: CreditCard }) {
  const { data: invoice } = useCreditCardInvoice(householdId, card.id);
  const deleteCard = useDeleteCreditCard(householdId);

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: card.color }}
            >
              <CardIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{card.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{card.brand}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Excluir cartão" onClick={() => deleteCard.mutate(card.id)}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fatura atual</span>
            <span className="font-medium">{formatCurrency(invoice?.total ?? 0)}</span>
          </div>
          <Progress value={invoice?.usedPercentage ?? 0} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Limite: {formatCurrency(card.creditLimit)}</span>
            <span>Vence dia {card.dueDay}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { Mail, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/layout/empty-state';
import { useHouseholdInvites, useRevokeInvite } from '@/lib/hooks/use-invites';
import { InviteStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const statusLabel: Record<InviteStatus, string> = {
  [InviteStatus.PENDING]: 'Pendente',
  [InviteStatus.ACCEPTED]: 'Aceito',
  [InviteStatus.DECLINED]: 'Recusado',
  [InviteStatus.EXPIRED]: 'Expirado',
  [InviteStatus.REVOKED]: 'Revogado',
};

export function InvitesList({ householdId }: { householdId: string }) {
  const { data: invites } = useHouseholdInvites(householdId);
  const revokeInvite = useRevokeInvite(householdId);

  if (!invites || invites.length === 0) {
    return <EmptyState icon={Mail} title="Nenhum convite enviado" />;
  }

  return (
    <ul className="divide-y">
      {invites.map((invite) => (
        <li key={invite.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium">{invite.email}</p>
            <p className="text-xs text-muted-foreground">Enviado em {formatDate(invite.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={invite.status === InviteStatus.PENDING ? 'secondary' : 'outline'}>
              {statusLabel[invite.status]}
            </Badge>
            {invite.status === InviteStatus.PENDING && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Revogar convite"
                onClick={() => revokeInvite.mutate(invite.id)}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

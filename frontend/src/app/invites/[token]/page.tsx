'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Mail, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthGuard } from '@/components/layout/auth-guard';
import { getApiErrorMessage } from '@/lib/api/client';
import { useAcceptInvite, useDeclineInvite } from '@/lib/hooks/use-invites';
import { useHouseholdStore } from '@/lib/stores/household-store';

export default function InviteTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const acceptInvite = useAcceptInvite();
  const declineInvite = useDeclineInvite();
  const setCurrentHouseholdId = useHouseholdStore((state) => state.setCurrentHouseholdId);

  const handleAccept = () => {
    acceptInvite.mutate(token, {
      onSuccess: (member) => {
        setCurrentHouseholdId(member.householdId);
        toast.success('Convite aceito! Bem-vindo(a) à casa.');
        router.push('/dashboard');
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  const handleDecline = () => {
    declineInvite.mutate(token, {
      onSuccess: () => {
        toast.info('Convite recusado');
        router.push('/dashboard');
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  return (
    <AuthGuard>
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            <Mail className="mb-2 h-10 w-10 text-primary" />
            <CardTitle>Convite para uma casa</CardTitle>
            <CardDescription>Você foi convidado(a) a participar de uma casa compartilhada.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-3">
            <Button variant="outline" onClick={handleDecline} disabled={declineInvite.isPending}>
              <XCircle className="h-4 w-4" />
              Recusar
            </Button>
            <Button onClick={handleAccept} disabled={acceptInvite.isPending}>
              <CheckCircle2 className="h-4 w-4" />
              Aceitar convite
            </Button>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}

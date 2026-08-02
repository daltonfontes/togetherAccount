'use client';

import * as React from 'react';
import { Copy, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditLogList } from '@/components/household/audit-log-list';
import { InviteDialog } from '@/components/household/invite-dialog';
import { InvitesList } from '@/components/household/invites-list';
import { MemberList } from '@/components/household/member-list';
import { useCurrentHousehold } from '@/lib/hooks/use-current-household';

export default function HouseholdPage() {
  const { household, householdId } = useCurrentHousehold();
  const [inviteOpen, setInviteOpen] = React.useState(false);

  if (!household || !householdId) {
    return null;
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(household.inviteCode);
    toast.success('Código de convite copiado');
  };

  return (
    <div>
      <PageHeader
        title={household.name}
        description={household.description || 'Gerencie os moradores da casa'}
        actions={
          <>
            <Button variant="outline" onClick={copyInviteCode}>
              <Copy className="h-4 w-4" />
              Código: {household.inviteCode}
            </Button>
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Convidar
            </Button>
          </>
        }
      />

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Moradores</TabsTrigger>
          <TabsTrigger value="invites">Convites</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>
        <TabsContent value="members">
          <Card>
            <CardContent className="pt-6">
              <MemberList householdId={householdId} ownerId={household.ownerId} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="invites">
          <Card>
            <CardContent className="pt-6">
              <InvitesList householdId={householdId} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="audit">
          <Card>
            <CardContent className="pt-6">
              <AuditLogList householdId={householdId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InviteDialog householdId={householdId} open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}

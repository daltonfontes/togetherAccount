'use client';

import { Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/household/role-badge';
import { useCurrentUser } from '@/lib/hooks/use-auth';
import { useHouseholdMembers, useRemoveMember } from '@/lib/hooks/use-households';
import { getInitials } from '@/lib/utils';

export function MemberList({ householdId, ownerId }: { householdId: string; ownerId: string }) {
  const { data: members } = useHouseholdMembers(householdId);
  const removeMember = useRemoveMember(householdId);
  const currentUser = useCurrentUser();

  return (
    <ul className="divide-y">
      {members?.map((member) => (
        <li key={member.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={member.user.avatarUrl} alt={member.user.fullName} />
              <AvatarFallback>{getInitials(member.user.fullName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{member.user.fullName}</p>
              <p className="text-xs text-muted-foreground">{member.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RoleBadge role={member.role} />
            {member.userId !== ownerId && member.userId !== currentUser?.id && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remover morador"
                onClick={() => removeMember.mutate(member.id)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

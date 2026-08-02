import { Badge } from '@/components/ui/badge';
import { HouseholdRole } from '@/lib/types';

const labels: Record<HouseholdRole, string> = {
  [HouseholdRole.OWNER]: 'Dono(a)',
  [HouseholdRole.ADMIN]: 'Admin',
  [HouseholdRole.MEMBER]: 'Membro',
};

export function RoleBadge({ role }: { role: HouseholdRole }) {
  return <Badge variant={role === HouseholdRole.OWNER ? 'default' : 'secondary'}>{labels[role]}</Badge>;
}

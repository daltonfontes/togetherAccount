'use client';

import { History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/layout/empty-state';
import { useQuery } from '@tanstack/react-query';
import { householdsApi } from '@/lib/api/households';
import { formatDate } from '@/lib/utils';

const actionLabel: Record<string, string> = {
  create: 'Criou',
  update: 'Atualizou',
  delete: 'Excluiu',
  login: 'Entrou',
  logout: 'Saiu',
  invite: 'Convidou',
  accept_invite: 'Aceitou convite',
  remove_member: 'Removeu morador',
};

export function AuditLogList({ householdId }: { householdId: string }) {
  const { data } = useQuery({
    queryKey: ['households', householdId, 'audit-logs'],
    queryFn: () => householdsApi.auditLogs(householdId, 1, 30),
  });

  const logs = data?.items ?? [];

  if (logs.length === 0) {
    return <EmptyState icon={History} title="Nenhum registro de auditoria ainda" />;
  }

  return (
    <ul className="divide-y">
      {logs.map((log) => (
        <li key={log.id} className="flex items-center justify-between py-3 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{actionLabel[log.action] ?? log.action}</Badge>
            <span>
              {log.user?.fullName ?? 'Sistema'} • {log.entityType}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{formatDate(log.createdAt, { dateStyle: 'short', timeStyle: 'short' })}</span>
        </li>
      ))}
    </ul>
  );
}

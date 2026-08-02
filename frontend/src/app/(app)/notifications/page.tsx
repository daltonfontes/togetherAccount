'use client';

import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/layout/empty-state';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/lib/hooks/use-notifications';
import { cn, formatDate } from '@/lib/utils';

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications(1, 50);
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const removeNotification = useDeleteNotification();

  const notifications = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Notificações"
        description="Fique por dentro do que acontece na sua casa"
        actions={
          <Button variant="outline" onClick={() => markAllAsRead.mutate()} disabled={notifications.length === 0}>
            <Check className="h-4 w-4" />
            Marcar todas como lidas
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState icon={Bell} title="Nenhuma notificação" />
          ) : (
            <ul className="divide-y">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={cn(
                    'flex items-start justify-between gap-4 py-3',
                    !notification.isRead && 'bg-accent/40 -mx-4 px-4 rounded-md',
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(notification.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Marcar como lida"
                        onClick={() => markAsRead.mutate(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Excluir notificação"
                      onClick={() => removeNotification.mutate(notification.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

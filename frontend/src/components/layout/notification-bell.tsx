'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUnreadCount } from '@/lib/hooks/use-notifications';

export function NotificationBell() {
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href="/notifications" aria-label="Notificações">
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]"
          >
            {count > 9 ? '9+' : count}
          </Badge>
        )}
      </Link>
    </Button>
  );
}

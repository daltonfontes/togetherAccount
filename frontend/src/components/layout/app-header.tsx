'use client';

import * as React from 'react';
import { Menu, Wallet2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { HouseholdSwitcher } from '@/components/layout/household-switcher';
import { NavLinks } from '@/components/layout/nav-links';
import { NotificationBell } from '@/components/layout/notification-bell';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { UserNav } from '@/components/layout/user-nav';

export function AppHeader() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Wallet2 className="h-5 w-5 text-primary" />
              Together Account
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden items-center gap-2 font-semibold lg:flex">
        <Wallet2 className="h-5 w-5 text-primary" />
        <span>Together Account</span>
      </div>

      <div className="flex-1">
        <HouseholdSwitcher />
      </div>

      <div className="flex items-center gap-1">
        <NotificationBell />
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}

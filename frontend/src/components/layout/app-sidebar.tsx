import { NavLinks } from '@/components/layout/nav-links';

export function AppSidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 border-r-2 border-border bg-background p-4 lg:block">
      <NavLinks />
    </aside>
  );
}

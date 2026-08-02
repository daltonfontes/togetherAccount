import { NavLinks } from '@/components/layout/nav-links';

export function AppSidebar() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r p-4 lg:block">
      <NavLinks />
    </aside>
  );
}

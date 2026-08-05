import type { Component } from 'vue';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  CreditCard,
  PiggyBank,
  Target,
  Users,
  BarChart3,
  Bell,
  Settings,
} from '@lucide/vue';

export interface NavItem {
  title: string;
  href: string;
  icon: Component;
}

export const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Transações', href: '/transactions', icon: ArrowLeftRight },
  { title: 'Contas', href: '/accounts', icon: Landmark },
  { title: 'Cartões', href: '/credit-cards', icon: CreditCard },
  { title: 'Orçamentos', href: '/budgets', icon: PiggyBank },
  { title: 'Metas', href: '/goals', icon: Target },
  { title: 'Casa', href: '/household', icon: Users },
  { title: 'Relatórios', href: '/reports', icon: BarChart3 },
  { title: 'Notificações', href: '/notifications', icon: Bell },
  { title: 'Configurações', href: '/settings', icon: Settings },
];

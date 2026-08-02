import { TransactionType } from '@/common/enums';

export interface DefaultCategorySeed {
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: DefaultCategorySeed[] = [
  { name: 'Salário', type: TransactionType.INCOME, icon: 'wallet', color: '#22c55e' },
  { name: 'Freelance', type: TransactionType.INCOME, icon: 'briefcase', color: '#10b981' },
  { name: 'Investimentos', type: TransactionType.INCOME, icon: 'trending-up', color: '#06b6d4' },
  { name: 'Outras Receitas', type: TransactionType.INCOME, icon: 'plus-circle', color: '#14b8a6' },

  { name: 'Moradia', type: TransactionType.EXPENSE, icon: 'home', color: '#f97316' },
  { name: 'Alimentação', type: TransactionType.EXPENSE, icon: 'utensils', color: '#ef4444' },
  { name: 'Transporte', type: TransactionType.EXPENSE, icon: 'car', color: '#eab308' },
  { name: 'Saúde', type: TransactionType.EXPENSE, icon: 'heart-pulse', color: '#ec4899' },
  { name: 'Educação', type: TransactionType.EXPENSE, icon: 'graduation-cap', color: '#8b5cf6' },
  { name: 'Lazer', type: TransactionType.EXPENSE, icon: 'party-popper', color: '#a855f7' },
  { name: 'Compras', type: TransactionType.EXPENSE, icon: 'shopping-bag', color: '#f43f5e' },
  { name: 'Contas Fixas', type: TransactionType.EXPENSE, icon: 'receipt', color: '#64748b' },
  { name: 'Assinaturas', type: TransactionType.EXPENSE, icon: 'repeat', color: '#0ea5e9' },
  { name: 'Pets', type: TransactionType.EXPENSE, icon: 'paw-print', color: '#84cc16' },
  {
    name: 'Outras Despesas',
    type: TransactionType.EXPENSE,
    icon: 'circle-ellipsis',
    color: '#78716c',
  },
];

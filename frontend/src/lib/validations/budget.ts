import { z } from 'zod';
import { MAX_MONETARY_VALUE } from './constants';

export const budgetSchema = z.object({
  categoryId: z.string().uuid('Selecione uma categoria'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000),
  limitAmount: z.coerce
    .number()
    .positive('Informe um valor maior que zero')
    .max(MAX_MONETARY_VALUE, 'Valor muito alto'),
  alertThreshold: z.coerce.number().min(0).max(100).default(80),
});
export type BudgetFormValues = z.infer<typeof budgetSchema>;

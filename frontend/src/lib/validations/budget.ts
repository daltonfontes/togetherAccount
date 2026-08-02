import { z } from 'zod';

export const budgetSchema = z.object({
  categoryId: z.string().uuid('Selecione uma categoria'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000),
  limitAmount: z.coerce.number().positive('Informe um valor maior que zero'),
  alertThreshold: z.coerce.number().min(0).max(100).default(80),
});
export type BudgetFormValues = z.infer<typeof budgetSchema>;

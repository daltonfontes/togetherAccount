import { z } from 'zod';

export const goalSchema = z.object({
  name: z.string().min(1, 'Informe um nome para a meta'),
  description: z.string().optional(),
  targetAmount: z.coerce.number().positive('Informe um valor maior que zero'),
  deadline: z.string().optional(),
  color: z.string().default('#22c55e'),
  icon: z.string().default('target'),
});
export type GoalFormValues = z.infer<typeof goalSchema>;

export const contributionSchema = z.object({
  amount: z.coerce.number().positive('Informe um valor maior que zero'),
  date: z.string().min(1, 'Informe a data'),
  note: z.string().optional(),
});
export type ContributionFormValues = z.infer<typeof contributionSchema>;

import { z } from 'zod';
import { HouseholdRole } from '@/lib/types';

export const householdSchema = z.object({
  name: z.string().min(2, 'Informe um nome para a casa'),
  description: z.string().optional(),
  currency: z.string().default('BRL'),
});
export type HouseholdFormValues = z.infer<typeof householdSchema>;

export const inviteSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  role: z.nativeEnum(HouseholdRole).default(HouseholdRole.MEMBER),
});
export type InviteFormValues = z.infer<typeof inviteSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, 'Informe um nome'),
  type: z.string(),
  icon: z.string().optional(),
  color: z.string().default('#64748b'),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

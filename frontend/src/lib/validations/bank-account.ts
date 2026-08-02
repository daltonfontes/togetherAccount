import { z } from 'zod';
import { AccountType } from '@/lib/types';

export const bankAccountSchema = z.object({
  name: z.string().min(1, 'Informe um nome'),
  bank: z.string().optional(),
  type: z.nativeEnum(AccountType).default(AccountType.CHECKING),
  balance: z.coerce.number().default(0),
  color: z.string().default('#3b82f6'),
  includeInTotal: z.boolean().default(true),
});
export type BankAccountFormValues = z.infer<typeof bankAccountSchema>;

import { z } from 'zod';
import { AccountType } from '@/lib/types';
import { MAX_MONETARY_VALUE } from './constants';

export const bankAccountSchema = z.object({
  name: z.string().min(1, 'Informe um nome'),
  bank: z.string().optional(),
  type: z.nativeEnum(AccountType).default(AccountType.CHECKING),
  balance: z.coerce
    .number()
    .max(MAX_MONETARY_VALUE, 'Valor muito alto')
    .default(0),
  color: z.string().default('#3b82f6'),
  includeInTotal: z.boolean().default(true),
});
export type BankAccountFormValues = z.infer<typeof bankAccountSchema>;

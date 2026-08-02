import { z } from 'zod';
import { RecurrenceFrequency, SplitMethod, TransactionType } from '@/lib/types';

export const transactionSchema = z
  .object({
    type: z.nativeEnum(TransactionType),
    amount: z.coerce.number().positive('Informe um valor maior que zero'),
    description: z.string().min(1, 'Informe uma descrição'),
    notes: z.string().optional(),
    date: z.string().min(1, 'Informe a data'),
    categoryId: z.string().uuid('Selecione uma categoria'),
    bankAccountId: z.string().optional(),
    creditCardId: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurrenceFrequency: z.nativeEnum(RecurrenceFrequency).optional(),
    recurrenceEndDate: z.string().optional(),
    isShared: z.boolean().default(false),
    splitMethod: z.nativeEnum(SplitMethod).optional(),
    splitUserIds: z.array(z.string()).optional(),
  })
  .refine((data) => !data.isShared || (data.splitUserIds && data.splitUserIds.length > 0), {
    message: 'Selecione ao menos uma pessoa para dividir',
    path: ['splitUserIds'],
  });

export type TransactionFormValues = z.infer<typeof transactionSchema>;

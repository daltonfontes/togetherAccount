import { z } from 'zod';
import { CardBrand } from '@/lib/types';
import { MAX_MONETARY_VALUE } from './constants';

export const creditCardSchema = z.object({
  name: z.string().min(1, 'Informe um nome'),
  brand: z.nativeEnum(CardBrand).default(CardBrand.OTHER),
  creditLimit: z.coerce
    .number()
    .min(0, 'Informe o limite do cartão')
    .max(MAX_MONETARY_VALUE, 'Valor muito alto'),
  closingDay: z.coerce.number().min(1).max(31),
  dueDay: z.coerce.number().min(1).max(31),
  color: z.string().default('#8b5cf6'),
});
export type CreditCardFormValues = z.infer<typeof creditCardSchema>;

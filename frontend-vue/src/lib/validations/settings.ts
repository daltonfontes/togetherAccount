import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Informe seu nome completo'),
  phone: z.string().optional(),
});
export type ProfileFormValues = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe sua senha atual'),
    newPassword: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Use letras maiúsculas, minúsculas e números'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
export type PasswordFormValues = z.infer<typeof passwordSchema>;

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const magicLinkSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
});
export type MagicLinkFormValues = z.infer<typeof magicLinkSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Informe seu nome completo'),
    email: z.string().email('Informe um e-mail válido'),
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Use letras maiúsculas, minúsculas e números'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

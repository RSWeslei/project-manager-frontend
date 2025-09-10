import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email().min(1, 'E-mail inválido').min(1, 'Informe seu e-mail'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
});

export const registerSchema = z
  .object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    email: z.email('E-mail inválido').min(1, 'Informe seu e-mail'),
    role: z.enum(['developer', 'manager', 'admin'], {}),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(8, 'Confirme a senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const imageFileSchema = z
  .instanceof(File)
  .refine((f) => f.size <= 5 * 1024 * 1024, { message: 'O arquivo deve ter no máximo 5MB.' })
  .refine((f) => /^image\//.test(f.type), { message: 'Apenas imagens são permitidas.' });
z.object({
  file: imageFileSchema,
});

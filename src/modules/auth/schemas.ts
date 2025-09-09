import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
});

export const imageFileSchema = z
  .instanceof(File)
  .refine((f) => f.size <= 5 * 1024 * 1024, { message: 'O arquivo deve ter no máximo 5MB.' })
  .refine((f) => /^image\//.test(f.type), { message: 'Apenas imagens são permitidas.' });

export const uploadPhotoSchema = z.object({
  file: imageFileSchema,
});

export type UploadPhotoInput = z.infer<typeof uploadPhotoSchema>;
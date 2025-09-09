// src/modules/projects/schemas.ts
import { z } from 'zod';

export const projectSchema = z.object({
    name: z.string().min(1, 'Informe o nome'),
    description: z.string().optional().nullable(),
    status: z.enum(['planned', 'active', 'completed', 'cancelled']),
    startDate: z.string().min(1, 'Data de início é obrigatória'),
    endDate: z.string().min(1, 'Data de fim é obrigatória')
});

export type ProjectInput = z.infer<typeof projectSchema>;

import { z } from 'zod';

export const taskBase = z.object({
  title: z.string().min(1, 'Informe o título'),
  description: z.string().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.number().int().positive().optional().nullable(),
});

export const taskCreateSchema = taskBase.extend({
  projectId: z
    .number({ required_error: 'Selecione o projeto' })
    .int()
    .positive('Selecione o projeto'),
});

export const taskUpdateSchema = taskBase.partial({}).extend({
  projectId: z.number().int().positive().optional().nullable(),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

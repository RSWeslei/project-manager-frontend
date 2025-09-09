// src/modules/tasks/hooks/useTasks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTask, deleteTask, listTasks, updateTask } from '@/modules/tasks/services/tasks.api';
import { TaskCreateInput, TaskUpdateInput } from '@/modules/tasks/schemas';
import { Task } from '@/modules/tasks/types';

export const useTasksList = (params: {
    q?: string;
    status?: string;
    priority?: string;
    projectId?: number;
}) => {
    return useQuery({
        queryKey: ['tasks', params],
        queryFn: () => listTasks(params),
        staleTime: 15_000
    });
};

export const useCreateTask = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: TaskCreateInput) => createTask(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
    });
};

export const useUpdateTask = (id: number) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: TaskUpdateInput) => updateTask(id, payload),
        onSuccess: (_data: Task) => qc.invalidateQueries({ queryKey: ['tasks'] })
    });
};

export const useDeleteTask = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: number }) => deleteTask(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
    });
};

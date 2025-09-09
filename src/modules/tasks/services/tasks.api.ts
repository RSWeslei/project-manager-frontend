// src/modules/tasks/services/tasks.api.ts
import { get, post, patch, del } from '@/shared/lib/http/client';
import { qs } from '@/shared/lib/http/query';
import { Task } from '@/modules/tasks/types';
import { TaskCreateInput, TaskUpdateInput } from '@/modules/tasks/schemas';

export const listTasks = async (params?: {
    q?: string;
    status?: string;
    priority?: string;
    projectId?: number;
}): Promise<Task[]> => {
    const query = qs({
        q: params?.q,
        status: params?.status,
        priority: params?.priority,
        projectId: params?.projectId
    });
    return get<Task[]>(`/tasks${query}`);
};

export const createTask = async (payload: TaskCreateInput): Promise<Task> => {
    return post<TaskCreateInput, Task>('/tasks', payload);
};

export const updateTask = async (id: number, payload: TaskUpdateInput): Promise<Task> => {
    const { projectId, ...rest } = payload;
    return patch<typeof rest, Task>(`/tasks/${id}`, rest);
};

export const deleteTask = async (id: number): Promise<{ id: number }> => {
    return del<{ id: number }>(`/tasks/${id}`);
};

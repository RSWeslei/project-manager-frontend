// src/modules/projects/services/projects.api.ts
import { get, post, patch, del } from '@/shared/lib/http/client';
import { qs } from '@/shared/lib/http/query';
import { Project } from '@/modules/projects/types';
import { ProjectInput } from '@/modules/projects/schemas';

export const listProjects = async (params?: { status?: string; q?: string }): Promise<Project[]> => {
  const query = qs({ status: params?.status, q: params?.q });
  return get<Project[]>(`/projects${query}`);
};

export const listActiveProjects = async (): Promise<Project[]> => {
  return listProjects({ status: 'active' });
};

export const createProject = async (payload: ProjectInput): Promise<Project> => {
  return post<ProjectInput, Project>('/projects', payload);
};

export const updateProject = async (id: number, payload: ProjectInput): Promise<Project> => {
  const sanitized: Record<string, unknown> = { ...payload };
  delete sanitized['managerId'];
  return patch<typeof sanitized, Project>(`/projects/${id}`, sanitized);
};

export const deleteProject = async (id: number): Promise<{ id: number }> => {
  return del<{ id: number }>(`/projects/${id}`);
};

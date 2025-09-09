import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from '@/modules/projects/services/projects.api';
import { Project } from '@/modules/projects/types';
import { ProjectInput } from '@/modules/projects/schemas';

export const projectsKeys = {
  all: ['projects'] as const,
  list: (params: { status?: string; q?: string }) => [...projectsKeys.all, 'list', params] as const,
};

export const useProjectsList = (params: { status?: string; q?: string }) => {
  return useQuery<Project[], Error>({
    queryKey: projectsKeys.list(params),
    queryFn: () => listProjects(params),
    staleTime: 30_000,
  });
};

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation<Project, Error, ProjectInput>({
    mutationFn: (payload) => createProject(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectsKeys.all }),
  });
};

export const useUpdateProject = (id: number) => {
  const qc = useQueryClient();
  return useMutation<Project, Error, ProjectInput>({
    mutationFn: (payload) => updateProject(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectsKeys.all }),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation<{ id: number }, Error, { id: number }>({
    mutationFn: ({ id }) => deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectsKeys.all }),
  });
};

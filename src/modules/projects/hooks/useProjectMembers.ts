import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addProjectMember,
  listProjectMembers,
  removeProjectMember,
  updateProjectMemberRole,
} from '@/modules/projects/services/projects.api';
import type { ProjectMemberRole } from '@/modules/projects/types';

const key = (projectId: number) => ['project-members', projectId] as const;

export function useProjectMembers(projectId: number) {
  return useQuery({
    queryKey: key(projectId),
    queryFn: () => listProjectMembers(projectId),
    enabled: projectId > 0,
  });
}

export function useAddProjectMember(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { userId: number; role: ProjectMemberRole }) =>
      addProjectMember({ projectId, ...p }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(projectId) }),
  });
}

export function useUpdateProjectMemberRole(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { userId: number; role: ProjectMemberRole }) =>
      updateProjectMemberRole({ projectId, ...p }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(projectId) }),
  });
}

export function useRemoveProjectMember(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => removeProjectMember(projectId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(projectId) }),
  });
}

export type ProjectStatus = 'planned' | 'active' | 'completed' | 'cancelled';

export type Project = {
  id: number;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  managerId?: number | null;
};

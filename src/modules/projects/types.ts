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

export type DashboardKPIs = {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
};

export type DashboardTasksPerUser = {
  assigneeId: number;
  count: string;
  assignee: {
    name: string;
  };
};

export type DashboardTasksByStatus = {
  status: 'todo' | 'in_progress' | 'review' | 'done';
  count: string;
};

export type DashboardData = {
  kpis: DashboardKPIs;
  tasksPerUser: DashboardTasksPerUser[];
  tasksByStatus: DashboardTasksByStatus[];
};

export type ProjectMemberRole = 'viewer' | 'contributor' | 'maintainer';

export type ProjectMemberUser = {
  id: number;
  name: string;
  email: string;
};

export type ProjectMember = {
  id: number;
  projectId: number;
  userId: number;
  role: ProjectMemberRole;
  user?: ProjectMemberUser;
};

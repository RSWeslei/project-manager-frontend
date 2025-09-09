export type KPI = {
  openTasks: number;
  overdueTasks: number;
  criticalTasks: number;
  activeProjects: number;
};

export type StatusKey = 'todo' | 'in_progress' | 'review' | 'done';

export type ByStatus = {
  status: StatusKey;
  count: number;
};

export type ByAssignee = {
  userId: number;
  name: string;
  count: number;
};

export type BurndownPoint = {
  date: string;
  remaining: number;
};

export type AnalyticsOverview = {
  kpis: KPI;
  byStatus: ByStatus[];
  byAssignee: ByAssignee[];
  burndown: BurndownPoint[];
};

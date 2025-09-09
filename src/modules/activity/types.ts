export type ActivityItem = {
  id: number;
  type: 'comment' | 'status_change' | 'assign' | 'create';
  message: string;
  createdAt: string;
  actor: { id: number; name: string };
  projectId?: number | null;
  taskId?: number | null;
};

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  projectId: number;
  assigneeId?: number | null;
  createdAt?: string;
  updatedAt?: string;
  project?: { id: number; name: string } | null;
  assignee?: { id: number; name: string } | null;
};

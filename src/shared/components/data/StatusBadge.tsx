import { Badge } from '@mantine/core';
import { JSX } from 'react';
import { TaskPriority, TaskStatus } from '@/modules/tasks/types';

export const TaskStatusBadge = ({ status }: { status: TaskStatus }): JSX.Element => {
  const map: Record<TaskStatus, { label: string; color: string }> = {
    todo: { label: 'A fazer', color: 'gray' },
    in_progress: { label: 'Em progresso', color: 'blue' },
    review: { label: 'Revisão', color: 'yellow' },
    done: { label: 'Concluída', color: 'green' },
  };
  const v = map[status];
  return (
    <Badge color={v.color} variant="light">
      {v.label}
    </Badge>
  );
};

export const TaskPriorityBadge = ({ priority }: { priority: TaskPriority }): JSX.Element => {
  const map: Record<TaskPriority, { label: string; color: string }> = {
    low: { label: 'Baixa', color: 'gray' },
    medium: { label: 'Média', color: 'blue' },
    high: { label: 'Alta', color: 'orange' },
    critical: { label: 'Crítica', color: 'red' },
  };
  const v = map[priority];
  return (
    <Badge color={v.color} variant="light">
      {v.label}
    </Badge>
  );
};

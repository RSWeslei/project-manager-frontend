import { JSX, useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { Button, Group, Modal, NativeSelect, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { Plus, Search } from 'lucide-react';
import { useToast } from '@/shared/components/ui/Toast';
import { Task, TaskPriority, TaskStatus } from '@/modules/tasks/types';
import {
  useCreateTask,
  useDeleteTask,
  useTasksList,
  useUpdateTask,
} from '@/modules/tasks/hooks/useTasks';
import { TaskCreateInput, TaskUpdateInput } from '@/modules/tasks/schemas';
import { TaskFormModal } from '@/modules/tasks/components/TaskFormModal';
import { TaskPriorityBadge, TaskStatusBadge } from '@/shared/components/data/StatusBadge';
import { listProjects } from '@/modules/projects/services/projects.api';
import { Project } from '@/modules/projects/types';
import { Column, DataTable } from '@/shared/components/data/DataTable';
import { usePermissions } from '@/modules/auth/hooks/usePermissions';
import { formatDateBR } from '@/shared/lib/date';

const TasksPage = (): JSX.Element => {
  const [q, setQ] = useState('');
  const [debouncedQ] = useDebouncedValue(q, 400);
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);

  const params = useMemo(
    () => ({
      q: debouncedQ,
      status: status || undefined,
      priority: priority || undefined,
      projectId: projectId ? Number(projectId) : undefined,
    }),
    [debouncedQ, status, priority, projectId],
  );

  const { data, isLoading } = useTasksList(params);
  const rows = useMemo(() => data ?? [], [data]);

  const { push } = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const createMut = useCreateTask();
  const updateMut = useUpdateTask(editing?.id ?? 0);
  const deleteMut = useDeleteTask();

  const { canCreate } = usePermissions();

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch(() => void 0);
  }, []);

  const onCreate = async (payload: TaskCreateInput) => {
    try {
      await createMut.mutateAsync(payload);
      setOpen(false);
      push({ title: 'Tarefa criada', variant: 'success' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao criar';
      push({ title: 'Erro', description: msg, variant: 'error' });
    }
  };

  const onUpdate = async (payload: TaskUpdateInput) => {
    if (!editing) return;
    try {
      await updateMut.mutateAsync(payload);
      setEditing(null);
      push({ title: 'Tarefa atualizada', variant: 'success' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao atualizar';
      push({ title: 'Erro', description: msg, variant: 'error' });
    }
  };

  const onDelete = async (id: number) => {
    try {
      await deleteMut.mutateAsync({ id });
      setConfirmId(null);
      push({ title: 'Tarefa removida', variant: 'success' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao remover';
      push({ title: 'Erro', description: msg, variant: 'error' });
    }
  };

  const columns: ReadonlyArray<Column<Task>> = [
    {
      id: 'title',
      header: 'Título',
      accessor: 'title',
      className: 'min-w-56',
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (t) => t.status,
      cell: (value) => <TaskStatusBadge status={value as TaskStatus} />,
      width: 140,
    },
    {
      id: 'priority',
      header: 'Prioridade',
      accessor: (t) => t.priority,
      cell: (value) => <TaskPriorityBadge priority={value as TaskPriority} />,
      width: 140,
    },
    {
      id: 'due',
      header: 'Vencimento',
      accessor: (t) => t.dueDate,
      cell: (value) => (value ? formatDateBR(value as string) : '—'),
      width: 140,
    },
    {
      id: 'project',
      header: 'Projeto',
      accessor: (t) => t.project?.name ?? '—',
      width: 220,
    },
  ] as const;

  return (
    <Stack gap="lg">
      <Group align="end" wrap="wrap" gap="md">
        <TextInput
          label="Buscar"
          placeholder="Título, descrição..."
          value={q}
          onChange={(e) => setQ(e.currentTarget.value)}
          leftSection={<Search className="h-5 w-5" />}
          className="min-w-64 flex-1"
        />
        <NativeSelect
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.currentTarget.value)}
          data={[
            { value: '', label: 'Todos' },
            { value: 'todo', label: 'A fazer' },
            { value: 'in_progress', label: 'Em progresso' },
            { value: 'review', label: 'Revisão' },
            { value: 'done', label: 'Concluída' },
          ]}
          className="w-full sm:w-48"
        />
        <NativeSelect
          label="Prioridade"
          value={priority}
          onChange={(e) => setPriority(e.currentTarget.value)}
          data={[
            { value: '', label: 'Todas' },
            { value: 'low', label: 'Baixa' },
            { value: 'medium', label: 'Média' },
            { value: 'high', label: 'Alta' },
            { value: 'critical', label: 'Crítica' },
          ]}
          className="w-full sm:w-48"
        />
        <NativeSelect
          label="Projeto"
          value={projectId}
          onChange={(e) => setProjectId(e.currentTarget.value)}
          data={[
            { value: '', label: 'Todos' },
            ...projects.map((p) => ({ value: String(p.id), label: p.name })),
          ]}
          className="w-full sm:w-60"
        />

        <Tooltip label="Sem permissão" disabled={canCreate} withArrow>
          <Button
            onClick={() => canCreate && setOpen(true)}
            leftSection={<Plus className="h-5 w-5" />}
            disabled={!canCreate}
          >
            Nova tarefa
          </Button>
        </Tooltip>
      </Group>

      <DataTable<Task>
        data={rows}
        columns={columns}
        rowKey={(t) => t.id}
        loading={isLoading}
        striped
        stickyHeader
        minWidth={900}
        rowActions={{
          onEdit: (row) => setEditing(row),
          onDelete: (row) => setConfirmId(row.id),
          width: 140,
        }}
        empty={
          <Stack align="center" gap="xs">
            <Text c="dimmed" size="sm">
              Sem resultados
            </Text>
          </Stack>
        }
      />

      <TaskFormModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={onCreate}
        onUpdate={onUpdate}
        loading={createMut.isPending || updateMut.isPending}
        initial={null}
      />

      <TaskFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
        loading={updateMut.isPending}
        initial={editing}
      />

      <Modal
        opened={confirmId !== null}
        onClose={() => setConfirmId(null)}
        title="Confirmar remoção"
        centered
        radius="lg"
      >
        <Text size="sm" c="dimmed">
          Tem certeza que deseja remover esta tarefa?
        </Text>
        <Group justify="end" mt="md">
          <Button variant="outline" onClick={() => setConfirmId(null)}>
            Cancelar
          </Button>
          <Button
            color="red"
            loading={deleteMut.isPending}
            onClick={() => confirmId !== null && onDelete(confirmId)}
          >
            Remover
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
};

export default TasksPage;

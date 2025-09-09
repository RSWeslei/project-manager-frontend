// src/modules/tasks/pages/TasksPage.tsx
import { JSX, useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { ActionIcon, Badge, Button, Card, Group, Modal, NativeSelect, ScrollArea, Stack, Text, TextInput } from '@mantine/core';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/shared/components/ui/Toast';
import { Task } from '@/modules/tasks/types';
import { useCreateTask, useDeleteTask, useTasksList, useUpdateTask } from '@/modules/tasks/hooks/useTasks';
import { TaskCreateInput, TaskUpdateInput } from '@/modules/tasks/schemas';
import { TaskFormModal } from '@/modules/tasks/components/TaskFormModal';
import { TaskPriorityBadge, TaskStatusBadge } from '@/shared/components/data/StatusBadge';
import { listActiveProjects } from '@/modules/projects/services/projects.api';
import { Project } from '@/modules/projects/types';

const TasksPage = (): JSX.Element => {
    const [q, setQ] = useState('');
    const [debouncedQ] = useDebouncedValue(q, 400);
    const [status, setStatus] = useState<string>('');
    const [priority, setPriority] = useState<string>('');
    const [projectId, setProjectId] = useState<string>('');

    const params = useMemo(
        () => ({
            q: debouncedQ,
            status: status || undefined,
            priority: priority || undefined,
            projectId: projectId ? Number(projectId) : undefined
        }),
        [debouncedQ, status, priority, projectId]
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

    const [projects, setProjects] = useState<Project[]>([]);
    useEffect(() => {
        listActiveProjects().then(setProjects).catch(() => void 0);
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

    return (
        <Stack gap="lg">
            <Group align="end" wrap="wrap" gap="md">
                <TextInput
                    label="Buscar"
                    placeholder="Título, descrição..."
                    value={q}
                    onChange={(e) => setQ(e.currentTarget.value)}
                    leftSection={<Search className="h-5 w-5" />}
                    className="flex-1 min-w-64"
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
                        { value: 'done', label: 'Concluída' }
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
                        { value: 'critical', label: 'Crítica' }
                    ]}
                    className="w-full sm:w-48"
                />
                <NativeSelect
                    label="Projeto"
                    value={projectId}
                    onChange={(e) => setProjectId(e.currentTarget.value)}
                    data={[{ value: '', label: 'Todos' }, ...projects.map((p) => ({ value: String(p.id), label: p.name }))]}
                    className="w-full sm:w-60"
                />
                <Button onClick={() => setOpen(true)} leftSection={<Plus className="h-5 w-5" />}>
                    Nova tarefa
                </Button>
            </Group>

            <Card withBorder radius="lg" p="0">
                <ScrollArea type="auto">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                        <tr className="text-left text-sm text-muted">
                            <th className="border-b border-[var(--border)] px-4 py-3 font-medium">Título</th>
                            <th className="border-b border-[var(--border)] px-4 py-3 font-medium">Status</th>
                            <th className="border-b border-[var(--border)] px-4 py-3 font-medium">Prioridade</th>
                            <th className="border-b border-[var(--border)] px-4 py-3 font-medium">Vencimento</th>
                            <th className="border-b border-[var(--border)] px-4 py-3 font-medium">Projeto</th>
                            <th className="border-b border-[var(--border)] px-4 py-3 font-medium">Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-sm text-muted">carregando...</td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-10">
                                    <Stack align="center" gap="xs">
                                        <Text c="dimmed" size="sm">Sem resultados</Text>
                                        <Button variant="outline" onClick={() => setOpen(true)} leftSection={<Plus className="h-4 w-4" />}>
                                            Criar primeira tarefa
                                        </Button>
                                    </Stack>
                                </td>
                            </tr>
                        ) : (
                            rows.map((t) => (
                                <tr key={t.id} className="text-sm">
                                    <td className="border-b border-[var(--border)] px-4 py-3">{t.title}</td>
                                    <td className="border-b border-[var(--border)] px-4 py-3"><TaskStatusBadge status={t.status} /></td>
                                    <td className="border-b border-[var(--border)] px-4 py-3"><TaskPriorityBadge priority={t.priority} /></td>
                                    <td className="border-b border-[var(--border)] px-4 py-3">
                                        {t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : '—'}
                                    </td>
                                    <td className="border-b border-[var(--border)] px-4 py-3">{t.project?.name ?? '—'}</td>
                                    <td className="border-b border-[var(--border)] px-4 py-3">
                                        <Group gap="xs">
                                            <ActionIcon variant="light" aria-label="Editar" onClick={() => setEditing(t)}>
                                                <Pencil className="h-4 w-4" />
                                            </ActionIcon>
                                            <ActionIcon variant="light" color="red" aria-label="Remover" onClick={() => setConfirmId(t.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </ActionIcon>
                                        </Group>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </ScrollArea>
            </Card>

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

            <Modal opened={confirmId !== null} onClose={() => setConfirmId(null)} title="Confirmar remoção" centered radius="lg">
                <Text size="sm" c="dimmed">Tem certeza que deseja remover esta tarefa?</Text>
                <Group justify="end" mt="md">
                    <Button variant="outline" onClick={() => setConfirmId(null)}>Cancelar</Button>
                    <Button color="red" loading={deleteMut.isPending} onClick={() => confirmId !== null && onDelete(confirmId)}>Remover</Button>
                </Group>
            </Modal>
        </Stack>
    );
};

export default TasksPage;

// src/modules/projects/pages/ProjectsPage.tsx
import { JSX, useMemo, useState } from 'react';
import { useProjectsList, useCreateProject, useUpdateProject, useDeleteProject } from '@/modules/projects/hooks/useProjects';
import { Project } from '@/modules/projects/types';
import { ProjectFormModal } from '@/modules/projects/components/ProjectFormModal';
import { useToast } from '@/shared/components/ui/Toast';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Group,
    Modal,
    NativeSelect,
    ScrollArea,
    Stack,
    Text,
    TextInput
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { ProjectInput } from '@/modules/projects/schemas';

const ProjectsPage = (): JSX.Element => {
    const [q, setQ] = useState('');
    const [debouncedQ] = useDebouncedValue(q, 400);
    const [status, setStatus] = useState<string>('');

    const listParams = useMemo(() => ({ q: debouncedQ, status: status || undefined }), [debouncedQ, status]);
    const { data, isLoading } = useProjectsList(listParams);

    const { push } = useToast();

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Project | null>(null);
    const [confirmId, setConfirmId] = useState<number | null>(null);

    const createMut = useCreateProject();
    const updateMut = useUpdateProject(editing?.id ?? 0);
    const deleteMut = useDeleteProject();

    const rows = useMemo(() => data ?? [], [data]);

    const onCreate = async (payload: ProjectInput) => {
        try {
            await createMut.mutateAsync(payload);
            setOpen(false);
            push({ title: 'Projeto criado', variant: 'success' });
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Erro ao criar';
            push({ title: 'Erro', description: msg, variant: 'error' });
        }
    };

    const onUpdate = async (payload: ProjectInput) => {
        if (!editing) return;
        try {
            await updateMut.mutateAsync(payload);
            setEditing(null);
            push({ title: 'Projeto atualizado', variant: 'success' });
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Erro ao atualizar';
            push({ title: 'Erro', description: msg, variant: 'error' });
        }
    };

    const onDelete = async (id: number) => {
        try {
            await deleteMut.mutateAsync({ id });
            setConfirmId(null);
            push({ title: 'Projeto removido', variant: 'success' });
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Erro ao remover';
            push({ title: 'Erro', description: msg, variant: 'error' });
        }
    };

    const statusColor: Record<Project['status'], string> = {
        planned: 'gray',
        active: 'green',
        completed: 'blue',
        cancelled: 'red'
    };

    return (
        <Stack gap="lg">
            <Group align="end" wrap="wrap" gap="md">
                <TextInput
                    label="Buscar"
                    placeholder="Nome, descrição..."
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
                        { value: 'planned', label: 'Planejado' },
                        { value: 'active', label: 'Ativo' },
                        { value: 'completed', label: 'Concluído' },
                        { value: 'cancelled', label: 'Cancelado' }
                    ]}
                    className="w-full sm:w-60"
                />
                <Button onClick={() => setOpen(true)} leftSection={<Plus className="h-5 w-5" />}>
                    Novo projeto
                </Button>
            </Group>

            <Card withBorder radius="lg" p="0">
                <ScrollArea type="auto">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                        <tr className="text-left text-sm text-muted">
                            <th className="border-b border-[var(--border)] px-4 py-3 font-medium">Nome</th>
                            <th className="border-b border-[var(--border)] px-4 py-3 font-medium">Status</th>
                            <th className="border-b border-[var(--border)] px-4 py-3 font-medium">Início</th>
                            <th className="border-b border-[var(--border)] px-4 py-3 font-medium">Fim</th>
                            <th className="border-b border-[var(--border)] px-4 py-3 font-medium">Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-sm text-muted">carregando...</td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-10">
                                    <Stack align="center" gap="xs">
                                        <Text c="dimmed" size="sm">
                                            Sem resultados
                                        </Text>
                                        <Button variant="outline" onClick={() => setOpen(true)} leftSection={<Plus className="h-4 w-4" />}>
                                            Criar primeiro projeto
                                        </Button>
                                    </Stack>
                                </td>
                            </tr>
                        ) : (
                            rows.map((p) => (
                                <tr key={p.id} className="text-sm">
                                    <td className="border-b border-[var(--border)] px-4 py-3">{p.name}</td>
                                    <td className="border-b border-[var(--border)] px-4 py-3">
                                        <Badge color={statusColor[p.status]} variant="light">
                                            {p.status}
                                        </Badge>
                                    </td>
                                    <td className="border-b border-[var(--border)] px-4 py-3">
                                        {p.startDate ? new Date(p.startDate).toISOString().slice(0, 10) : '—'}
                                    </td>
                                    <td className="border-b border-[var(--border)] px-4 py-3">
                                        {p.endDate ? new Date(p.endDate).toISOString().slice(0, 10) : '—'}
                                    </td>
                                    <td className="border-b border-[var(--border)] px-4 py-3">
                                        <Group gap="xs">
                                            <ActionIcon
                                                variant="light"
                                                aria-label="Editar"
                                                onClick={() => setEditing(p)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant="light"
                                                color="red"
                                                aria-label="Remover"
                                                onClick={() => setConfirmId(p.id)}
                                            >
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

            <ProjectFormModal
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={onCreate}
                loading={createMut.isPending}
                initial={null}
            />

            <ProjectFormModal
                open={!!editing}
                onClose={() => setEditing(null)}
                onSubmit={onUpdate}
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
                    Tem certeza que deseja remover este projeto? Esta ação não pode ser desfeita.
                </Text>
                <Group justify="end" mt="md">
                    <Button variant="outline" onClick={() => setConfirmId(null)}>
                        Cancelar
                    </Button>
                    <Button color="red" loading={deleteMut.isPending} onClick={() => confirmId !== null && onDelete(confirmId)}>
                        Remover
                    </Button>
                </Group>
            </Modal>
        </Stack>
    );
};

export default ProjectsPage;

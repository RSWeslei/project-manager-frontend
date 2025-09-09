// src/modules/tasks/components/TaskFormModal.tsx
import { JSX, useEffect, useMemo, useState } from 'react';
import { Button, Group, Modal, NativeSelect, Stack, TextInput } from '@mantine/core';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task, TaskPriority, TaskStatus } from '@/modules/tasks/types';
import { TaskCreateInput, TaskUpdateInput, taskCreateSchema, taskUpdateSchema } from '@/modules/tasks/schemas';
import { listActiveProjects } from '@/modules/projects/services/projects.api';
import { Project } from '@/modules/projects/types';

type Props = {
    open: boolean;
    onClose: () => void;
    onCreate: (data: TaskCreateInput) => void;
    onUpdate: (data: TaskUpdateInput) => void;
    loading?: boolean;
    initial?: Task | null;
};

const statuses: Array<{ value: TaskStatus; label: string }> = [
    { value: 'todo', label: 'A fazer' },
    { value: 'in_progress', label: 'Em progresso' },
    { value: 'review', label: 'Revisão' },
    { value: 'done', label: 'Concluída' }
];

const priorities: Array<{ value: TaskPriority; label: string }> = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'critical', label: 'Crítica' }
];

const toDateInput = (iso?: string | null): string => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

export const TaskFormModal = ({ open, onClose, onCreate, onUpdate, loading, initial }: Props): JSX.Element => {
    const schema = useMemo(() => (initial ? taskUpdateSchema : taskCreateSchema), [initial]);
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: initial
            ? {
                title: initial.title,
                description: initial.description ?? '',
                status: initial.status,
                priority: initial.priority,
                dueDate: toDateInput(initial.dueDate),
                assigneeId: initial.assignee?.id ?? undefined,
                projectId: initial.projectId
            }
            : {
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
                dueDate: '',
                assigneeId: undefined,
                projectId: undefined as unknown as number
            }
    });

    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        if (!open) return;
        let mounted = true;
        listActiveProjects()
            .then((p) => mounted && setProjects(p))
            .catch(() => void 0);
        return () => {
            mounted = false;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        if (initial) {
            form.reset({
                title: initial.title,
                description: initial.description ?? '',
                status: initial.status,
                priority: initial.priority,
                dueDate: toDateInput(initial.dueDate),
                assigneeId: initial.assignee?.id ?? undefined,
                projectId: initial.projectId
            } as any);
        } else {
            form.reset({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
                dueDate: '',
                assigneeId: undefined,
                projectId: undefined as unknown as number
            } as any);
        }
    }, [open, initial, form]);

    const submit = (data: any) => {
        if (initial) onUpdate(data as TaskUpdateInput);
        else onCreate(data as TaskCreateInput);
    };

    const openPicker = (el: HTMLInputElement) => el?.showPicker?.();

    return (
        <Modal
            opened={open}
            onClose={onClose}
            title={initial ? 'Editar tarefa' : 'Nova tarefa'}
            size="800px"
            radius="lg"
            centered
        >
            <Stack gap="md">
                <TextInput
                    label="Título"
                    placeholder="Escreva um título"
                    {...form.register('title')}
                    error={(form.formState.errors as any).title?.message}
                    withAsterisk
                />
                <TextInput label="Descrição" placeholder="Opcional" {...form.register('description')} />
                <Group gap="md" grow>
                    <NativeSelect
                        label="Status"
                        {...form.register('status')}
                        data={statuses.map((s) => ({ value: s.value, label: s.label }))}
                    />
                    <NativeSelect
                        label="Prioridade"
                        {...form.register('priority')}
                        data={priorities.map((p) => ({ value: p.value, label: p.label }))}
                    />
                    <TextInput
                        type="date"
                        label="Vencimento"
                        {...form.register('dueDate')}
                        onClick={(e) => openPicker(e.currentTarget)}
                        onFocus={(e) => openPicker(e.currentTarget)}
                    />
                </Group>
                {!initial ? (
                    <NativeSelect
                        label="Projeto"
                        {...form.register('projectId', { valueAsNumber: true })}
                        data={[
                            { value: '', label: 'Selecione' },
                            ...projects.map((p) => ({ value: String(p.id), label: p.name }))
                        ]}
                        withAsterisk
                    />
                ) : null}
                <Group justify="end" mt="xs">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={form.handleSubmit(submit)} loading={loading}>Salvar</Button>
                </Group>
            </Stack>
        </Modal>
    );
};

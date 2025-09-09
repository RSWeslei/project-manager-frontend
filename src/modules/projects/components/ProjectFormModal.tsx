// src/modules/projects/components/ProjectFormModal.tsx
import { JSX, useEffect } from 'react';
import { Modal, TextInput, NativeSelect, Button, Group, Stack } from '@mantine/core';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, ProjectInput } from '@/modules/projects/schemas';
import { Project } from '@/modules/projects/types';

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ProjectInput) => void;
    loading?: boolean;
    initial?: Project | null;
};

const statuses: Array<{ value: Project['status']; label: string }> = [
    { value: 'planned', label: 'Planejado' },
    { value: 'active', label: 'Ativo' },
    { value: 'completed', label: 'Concluído' },
    { value: 'cancelled', label: 'Cancelado' }
];

type FormValues = z.infer<typeof projectSchema>;

const toDateInput = (iso?: string | null): string => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

export const ProjectFormModal = ({ open, onClose, onSubmit, loading, initial }: Props): JSX.Element => {
    const form = useForm<FormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: '',
            description: '',
            status: 'planned',
            startDate: '',
            endDate: ''
        }
    });

    useEffect(() => {
        if (!open) return;
        if (initial) {
            form.reset({
                name: initial.name ?? '',
                description: initial.description ?? '',
                status: initial.status,
                startDate: toDateInput(initial.startDate),
                endDate: toDateInput(initial.endDate)
            });
        } else {
            form.reset({
                name: '',
                description: '',
                status: 'planned',
                startDate: '',
                endDate: ''
            });
        }
    }, [open, initial, form]);

    const submit = (data: FormValues) => onSubmit(data);

    const openNativePicker = (el: HTMLInputElement) => el?.showPicker?.();

    return (
        <Modal
            opened={open}
            onClose={onClose}
            title={initial ? 'Editar projeto' : 'Novo projeto'}
            size="700px"
            radius="lg"
            centered
        >
            <Stack gap="md">
                <TextInput
                    label="Nome"
                    placeholder="Projeto X"
                    {...form.register('name')}
                    error={form.formState.errors.name?.message}
                    withAsterisk
                />
                <TextInput
                    label="Descrição"
                    placeholder="Opcional"
                    {...form.register('description')}
                />
                <Group gap="md" grow>
                    <NativeSelect
                        label="Status"
                        {...form.register('status')}
                        data={statuses.map((s) => ({ value: s.value, label: s.label }))}
                    />
                    <TextInput
                        type="date"
                        label="Início"
                        withAsterisk
                        {...form.register('startDate')}
                        error={form.formState.errors.startDate?.message}
                        onClick={(e) => openNativePicker(e.currentTarget)}
                        onFocus={(e) => openNativePicker(e.currentTarget)}
                    />
                    <TextInput
                        type="date"
                        label="Fim"
                        withAsterisk
                        {...form.register('endDate')}
                        error={form.formState.errors.endDate?.message}
                        onClick={(e) => openNativePicker(e.currentTarget)}
                        onFocus={(e) => openNativePicker(e.currentTarget)}
                    />
                </Group>
                <Group justify="end" mt="xs">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={form.handleSubmit(submit)} loading={loading}>Salvar</Button>
                </Group>
            </Stack>
        </Modal>
    );
};

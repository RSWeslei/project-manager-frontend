import { JSX, useEffect, useMemo, useState } from 'react';
import { Button, Group, Modal, NativeSelect, Select, Stack, TextInput } from '@mantine/core';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task, TaskPriority, TaskStatus } from '@/modules/tasks/types';
import { TaskCreateInput, TaskUpdateInput, taskCreateSchema, taskUpdateSchema } from '@/modules/tasks/schemas';
import { listProjects } from '@/modules/projects/services/projects.api';
import { Project } from '@/modules/projects/types';
import { useDebouncedValue } from '@mantine/hooks';
import { searchUsers } from '@/modules/projects/services/users.api';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: TaskCreateInput) => void;
  onUpdate: (data: TaskUpdateInput) => void;
  loading?: boolean;
  initial?: Task | null;
};

const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: 'todo', label: 'A fazer' },
  { value: 'in_progress', label: 'Em progresso' },
  { value: 'review', label: 'Revisão' },
  { value: 'done', label: 'Concluída' },
];

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
];

const toDateInput = (iso?: string | null): string =>
  iso ? new Date(iso).toISOString().slice(0, 10) : '';

type UserOption = { value: string; label: string };

type FormValues = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;        // obrigatório no form
  assigneeId: number;     // obrigatório no form
  projectId: number | undefined; // obrigatório na criação
};

export const TaskFormModal = ({
                                open,
                                onClose,
                                onCreate,
                                onUpdate,
                                loading,
                                initial,
                              }: Props): JSX.Element => {
  // Schema base (create/update) vindo do app, estendido para exigir dueDate e assigneeId no form
  const baseSchema = useMemo(() => (initial ? taskUpdateSchema : taskCreateSchema), [initial]);
  const formSchema = useMemo(
    () =>
      baseSchema.extend({
        assigneeId: z
          .number({ required_error: 'Selecione o responsável', invalid_type_error: 'Selecione o responsável' })
          .int()
          .positive('Selecione o responsável'),
        dueDate: z.string().min(1, 'Informe a data de vencimento'),
      }),
    [baseSchema],
  );

  // Option "selecionado atual" (para edição): usa assigneeId do root e name do include
  const currentAssigneeOption: UserOption | null = useMemo(() => {
    const id = initial?.assigneeId;
    if (!id) return null;
    const label = initial?.assignee?.name ?? `Usuário #${id}`;
    return { value: String(id), label };
  }, [initial?.assigneeId, initial?.assignee?.name]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial
      ? {
        title: initial.title,
        description: initial.description ?? '',
        status: initial.status,
        priority: initial.priority,
        // se dueDate vier null, deixa vazio pra forçar o usuário escolher (é obrigatório)
        dueDate: toDateInput(initial.dueDate),
        assigneeId: (initial.assigneeId ?? undefined) as unknown as number,
        projectId: initial.projectId,
      }
      : {
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        assigneeId: undefined as unknown as number,
        projectId: undefined,
      },
  });

  // Carregar projetos (para criação)
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    if (!open) return;
    let mounted = true;
    listProjects()
      .then((p) => mounted && setProjects(p))
      .catch(() => void 0);
    return () => {
      mounted = false;
    };
  }, [open]);

  // Resetar o form ao abrir/trocar initial
  useEffect(() => {
    if (!open) return;
    if (initial) {
      form.reset({
        title: initial.title,
        description: initial.description ?? '',
        status: initial.status,
        priority: initial.priority,
        dueDate: toDateInput(initial.dueDate),
        assigneeId: (initial.assigneeId ?? undefined) as unknown as number,
        projectId: initial.projectId,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        assigneeId: undefined as unknown as number,
        projectId: undefined,
      });
    }
  }, [open, initial, form]);

  // Busca de usuários
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedTerm] = useDebouncedValue(searchTerm, 300);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const run = async () => {
      try {
        const users = await searchUsers(debouncedTerm.trim());
        if (cancelled) return;

        const fetched: UserOption[] = users.map((u) => ({
          value: String(u.id),
          label: `${u.name}${u.email ? ` <${u.email}>` : ''}`,
        }));

        // Garante que o responsável atual esteja na lista ao editar
        const merged = currentAssigneeOption
          ? [currentAssigneeOption, ...fetched.filter((o) => o.value !== currentAssigneeOption.value)]
          : fetched;

        // Evita re-render desnecessário
        setUserOptions((prev) => {
          if (
            prev.length === merged.length &&
            prev.every((p, i) => p.value === merged[i].value && p.label === merged[i].label)
          ) {
            return prev;
          }
          return merged;
        });
      } catch {
        setUserOptions((prev) => (prev.length ? [] : prev));
      }
    };

    // Se abrindo o modal de edição e ainda não temos a opção atual, insere imediatamente
    if (currentAssigneeOption && !userOptions.some((o) => o.value === currentAssigneeOption.value)) {
      setUserOptions((prev) => [currentAssigneeOption!, ...prev]);
    }

    run();
    return () => {
      cancelled = true;
    };
    // deps controladas: reexecuta quando abrir, trocar termo, trocar responsável atual
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, debouncedTerm, currentAssigneeOption?.value, currentAssigneeOption?.label]);

  const submit = (data: FormValues) => {
    const base = {
      title: data.title,
      description: data.description ?? '',
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate,
      assigneeId: data.assigneeId,
    };

    if (initial) {
      onUpdate(base as TaskUpdateInput);
    } else {
      onCreate({ ...base, projectId: data.projectId as number } as TaskCreateInput);
    }
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
          error={form.formState.errors.title?.message}
          withAsterisk
        />

        <TextInput label="Descrição" placeholder="Opcional" {...form.register('description')} />

        <Group gap="md" grow>
          <NativeSelect
            label="Status"
            {...form.register('status')}
            data={STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
          />
          <NativeSelect
            label="Prioridade"
            {...form.register('priority')}
            data={PRIORITY_OPTIONS.map((p) => ({ value: p.value, label: p.label }))}
          />
          <TextInput
            type="date"
            label="Vencimento"
            {...form.register('dueDate')}
            error={form.formState.errors.dueDate?.message}
            onClick={(e) => openPicker(e.currentTarget)}
            onFocus={(e) => openPicker(e.currentTarget)}
            withAsterisk
          />
        </Group>

        <Controller
          control={form.control}
          name="assigneeId"
          render={({ field }) => (
            <Select
              label="Responsável"
              placeholder="Digite para buscar e selecione"
              searchable
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              data={userOptions}
              value={field.value != null ? String(field.value) : ''}
              onChange={(v) => field.onChange(v ? Number(v) : undefined)}
              nothingFoundMessage={searchTerm.trim().length === 0 ? 'Nenhum usuário' : 'Sem resultados'}
              error={form.formState.errors.assigneeId?.message}
              withAsterisk
            />
          )}
        />

        {!initial ? (
          <NativeSelect
            label="Projeto"
            {...form.register('projectId', { valueAsNumber: true })}
            data={[
              { value: '', label: 'Selecione' },
              ...projects.map((p) => ({ value: String(p.id), label: p.name })),
            ]}
            error={form.formState.errors.projectId?.message as string | undefined}
            withAsterisk
          />
        ) : null}

        <Group justify="end" mt="xs">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(submit)} loading={loading}>
            Salvar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

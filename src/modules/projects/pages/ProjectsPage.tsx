import { JSX, useMemo, useState } from 'react';
import {
  useCreateProject,
  useDeleteProject,
  useProjectsList,
  useUpdateProject,
} from '@/modules/projects/hooks/useProjects';
import { Project, ProjectStatus } from '@/modules/projects/types';
import { ProjectFormModal } from '@/modules/projects/components/ProjectFormModal';
import { useToast } from '@/shared/components/ui/Toast';
import { Plus, Search, Users as UsersIcon } from 'lucide-react';
import { Button, Group, Modal, NativeSelect, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { ProjectInput } from '@/modules/projects/schemas';
import { Column, DataTable } from '@/shared/components/data/DataTable';
import { usePermissions } from '@/modules/auth/hooks/usePermissions';
import { ProjectStatusBadge } from '@/shared/components/data/StatusBadge';
import { formatDateBR } from '@/shared/lib/date';
import { ProjectMembersDrawer } from '@/modules/projects/components/ProjectMembersDrawer';
import { searchUsers } from '@/modules/projects/services/users.api';

const ProjectsPage = (): JSX.Element => {
  const [q, setQ] = useState('');
  const [debouncedQ] = useDebouncedValue(q, 400);
  const [status, setStatus] = useState<string>('');

  const listParams = useMemo(
    () => ({ q: debouncedQ, status: status || undefined }),
    [debouncedQ, status],
  );
  const { data, isLoading } = useProjectsList(listParams);
  const rows = useMemo(() => data ?? [], [data]);

  const { push } = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // Drawer de membros
  const [openMembers, setOpenMembers] = useState(false);
  const [membersProject, setMembersProject] = useState<Project | null>(null);

  const createMut = useCreateProject();
  const updateMut = useUpdateProject(editing?.id ?? 0);
  const deleteMut = useDeleteProject();

  const { canCreate } = usePermissions();

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

  const columns: ReadonlyArray<Column<Project>> = [
    { id: 'name', header: 'Nome', accessor: 'name', className: 'min-w-56' },
    {
      id: 'status',
      header: 'Status',
      accessor: (p) => p.status,
      cell: (value) => <ProjectStatusBadge status={value as ProjectStatus} />,
      width: 140,
    },
    {
      id: 'start',
      header: 'Início',
      accessor: (p) => p.startDate,
      cell: (value) => (value ? formatDateBR(value as string) : '—'),
      width: 120,
    },
    {
      id: 'end',
      header: 'Fim',
      accessor: (p) => p.endDate,
      cell: (value) => (value ? formatDateBR(value as string) : '—'),
      width: 120,
    },
    // NOVA coluna: abrir Drawer de membros
    {
      id: 'members',
      header: 'Membros',
      accessor: (p) => p.id,
      cell: (_, row) => (
        <Button
          variant="light"
          size="xs"
          leftSection={<UsersIcon className="h-4 w-4" />}
          onClick={() => {
            setMembersProject(row);
            setOpenMembers(true);
          }}
        >
          Gerenciar
        </Button>
      ),
      width: 140,
    },
  ] as const;

  return (
    <Stack gap="lg">
      <Group align="end" wrap="wrap" gap="md">
        <TextInput
          label="Buscar"
          placeholder="Nome, descrição..."
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
            { value: 'planned', label: 'Planejado' },
            { value: 'active', label: 'Ativo' },
            { value: 'completed', label: 'Concluído' },
            { value: 'cancelled', label: 'Cancelado' },
          ]}
          className="w-full sm:w-60"
        />

        <Tooltip label="Sem permissão" disabled={canCreate} withArrow>
          <Button
            onClick={() => canCreate && setOpen(true)}
            leftSection={<Plus className="h-5 w-5" />}
            disabled={!canCreate}
          >
            Novo projeto
          </Button>
        </Tooltip>
      </Group>

      <DataTable<Project>
        data={rows}
        columns={columns}
        rowKey={(p) => p.id}
        loading={isLoading}
        striped
        minWidth={980}
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
          <Button
            color="red"
            loading={deleteMut.isPending}
            onClick={() => confirmId !== null && onDelete(confirmId)}
          >
            Remover
          </Button>
        </Group>
      </Modal>

      {/* Drawer de membros (usa seu users.api.ts para buscar usuários) */}
      <ProjectMembersDrawer
        open={openMembers}
        onClose={() => setOpenMembers(false)}
        project={membersProject}
        searchUsers={async (q) => {
          return await searchUsers(q);
        }}
      />
    </Stack>
  );
};

export default ProjectsPage;

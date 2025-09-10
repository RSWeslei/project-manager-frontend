import { useEffect, useMemo, useState, type JSX } from 'react';
import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  LoadingOverlay,
  Select,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/shared/components/ui/Toast';
import { useAuth } from '@/modules/auth/context/AuthContext';
import type { Project, ProjectMember, ProjectMemberRole } from '@/modules/projects/types';
import {
  useAddProjectMember,
  useProjectMembers,
  useRemoveProjectMember,
  useUpdateProjectMemberRole,
} from '@/modules/projects/hooks/useProjectMembers';

type UserOption = { value: string; label: string };

type Props = {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  searchUsers?: (q: string) => Promise<Array<{ id: number; name: string; email: string }>>;
};

const roleOptions: Array<{ value: ProjectMemberRole; label: string }> = [
  { value: 'viewer', label: 'Leitor(a)' },
  { value: 'contributor', label: 'Colaborador(a)' },
  { value: 'maintainer', label: 'Mantenedor(a)' },
];

function areUserOptionArraysEqual(a: UserOption[], b: UserOption[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const optionA = a[i];
    const optionB = b[i];
    if (!optionA || !optionB) return false;
    if (optionA.value !== optionB.value || optionA.label !== optionB.label) return false;
  }
  return true;
}

export function ProjectMembersDrawer({ open, onClose, project, searchUsers }: Props): JSX.Element {
  const projectId = project?.id ?? 0;

  const list = useProjectMembers(projectId);
  const addMut = useAddProjectMember(projectId);
  const updMut = useUpdateProjectMemberRole(projectId);
  const delMut = useRemoveProjectMember(projectId);

  const { user } = useAuth();
  const { push } = useToast();

  const members = useMemo(() => list.data ?? [], [list.data]);

  const canManage = useMemo(() => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'manager') return true;
    return members.some((m) => m.userId === user.id && m.role === 'maintainer');
  }, [user, members]);

  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [options, setOptions] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newRole, setNewRole] = useState<ProjectMemberRole>('viewer');

  useEffect(() => {
    if (!open || !searchUsers) return;

    const term = debouncedSearch.trim();
    let cancelled = false;

    (async () => {
      try {
        const result = await searchUsers(term);
        if (cancelled) return;

        const existing = new Set(members.map((m) => m.userId));
        const next = result
          .filter((u) => !existing.has(u.id))
          .map((u) => ({ value: String(u.id), label: `${u.name} <${u.email}>` }));

        setOptions((prev) => (areUserOptionArraysEqual(prev, next) ? prev : next));
      } catch {
        setOptions((prev) => (prev.length ? [] : prev));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, debouncedSearch, members, searchUsers]);

  useEffect(() => {
    if (!open) {
      setSelectedUser('');
      setSearch('');
      setOptions([]);
    }
  }, [open, projectId]);

  const onAdd = async () => {
    if (!selectedUser) return;
    try {
      await addMut.mutateAsync({ userId: Number(selectedUser), role: newRole });
      setSelectedUser('');
      setSearch('');
      push({ title: 'Membro adicionado', variant: 'success' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao adicionar';
      push({ title: 'Erro', description: msg, variant: 'error' });
    }
  };

  const onChangeRole = async (member: ProjectMember, role: ProjectMemberRole) => {
    if (member.role === role) return;
    try {
      await updMut.mutateAsync({ userId: member.userId, role });
      push({ title: 'Papel atualizado', variant: 'success' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao atualizar papel';
      push({ title: 'Erro', description: msg, variant: 'error' });
    }
  };

  const onRemove = async (member: ProjectMember) => {
    try {
      await delMut.mutateAsync(member.userId);
      push({ title: 'Membro removido', variant: 'success' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao remover';
      push({ title: 'Erro', description: msg, variant: 'error' });
    }
  };

  const loading = list.isLoading || addMut.isPending || updMut.isPending || delMut.isPending;

  return (
    <Drawer
      opened={open}
      onClose={onClose}
      position="right"
      size="lg"
      title={`Membros — ${project?.name ?? ''}`}
      radius="lg"
      overlayProps={{ opacity: 0.2 }}
    >
      <LoadingOverlay visible={loading} zIndex={1000} />
      <Stack gap="lg">
        <Stack gap="xs">
          <Text fw={600}>Adicionar membro</Text>
          <Group wrap="wrap" gap="sm" align="end">
            <Select
              label="Usuário"
              placeholder="Digite para buscar e selecione"
              searchable
              searchValue={search}
              onSearchChange={setSearch}
              data={options}
              value={selectedUser}
              onChange={(v) => setSelectedUser(v ?? '')}
              nothingFoundMessage={search.trim().length === 0 ? 'Nenhum usuário' : 'Sem resultados'}
              className="min-w-72 flex-1"
              disabled={!canManage}
            />
            <Select
              label="Papel"
              data={roleOptions}
              value={newRole}
              onChange={(v) => setNewRole((v ?? 'viewer') as ProjectMemberRole)}
              className="w-52"
              disabled={!canManage}
            />
            <Tooltip label="Sem permissão" disabled={canManage} withArrow>
              <Button
                leftSection={<Plus className="h-5 w-5" />}
                onClick={onAdd}
                disabled={!canManage || !selectedUser}
              >
                Adicionar
              </Button>
            </Tooltip>
          </Group>
        </Stack>

        <Table striped highlightOnHover withRowBorders={false} verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nome</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Papel</Table.Th>
              <Table.Th>Remover</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {members.map((m) => (
              <Table.Tr key={m.id}>
                <Table.Td>{m.user?.name ?? m.userId}</Table.Td>
                <Table.Td>{m.user?.email ?? '—'}</Table.Td>
                <Table.Td>
                  <Select
                    data={roleOptions}
                    value={m.role}
                    onChange={(v) => v && onChangeRole(m, v as ProjectMemberRole)}
                    disabled={!canManage}
                    className="w-60"
                  />
                </Table.Td>
                <Table.Td>
                  <Tooltip label="Sem permissão" disabled={canManage} withArrow>
                    <ActionIcon
                      variant="light"
                      color="red"
                      aria-label="Remover"
                      onClick={() => canManage && onRemove(m)}
                      disabled={!canManage}
                    >
                      <Trash2 className="h-4 w-4" />
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
              </Table.Tr>
            ))}
            {members.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text c="dimmed" ta="center">
                    Sem membros ainda
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Stack>
    </Drawer>
  );
}

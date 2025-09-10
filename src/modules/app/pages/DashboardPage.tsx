import { useState, useMemo } from 'react';
import {
  Card,
  Grid,
  Group,
  NativeSelect,
  Stack,
  Text,
  Title,
  Table,
  Skeleton,
} from '@mantine/core';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useProjectsList, useDashboardData } from '@/modules/projects/hooks/useProjects';
import { useTasksList } from '@/modules/tasks/hooks/useTasks';
import { TaskStatusBadge } from '@/shared/components/data/StatusBadge';
import { Task } from '@/modules/tasks/types';
import { DashboardTasksByStatus } from '@/modules/projects/types';

const STATUS_COLORS: Record<string, string> = {
  done: 'var(--mantine-color-teal-6)',
  in_progress: 'var(--mantine-color-blue-6)',
  review: 'var(--mantine-color-yellow-6)',
  todo: 'var(--mantine-color-gray-6)',
};

const STATUS_LABELS: Record<string, string> = {
  done: 'Concluída',
  in_progress: 'Em Progresso',
  review: 'Revisão',
  todo: 'Pendente',
};

const DashboardPage = () => {
  const [projectId, setProjectId] = useState<string>('');

  const { data: projects, isLoading: isLoadingProjects } = useProjectsList({});

  const selectedProjectId = projectId ? Number(projectId) : null;

  const { data: dashboardData, isLoading: isLoadingDashboard } =
    useDashboardData(selectedProjectId);

  const { data: recentTasks, isLoading: isLoadingTasks } = useTasksList({
    projectId: selectedProjectId ?? undefined,
  });

  const kpis = useMemo(
    () =>
      dashboardData?.kpis || { totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0 },
    [dashboardData],
  );

  const tasksPerUser = useMemo(() => dashboardData?.tasksPerUser || [], [dashboardData]);

  const tasksByStatus = useMemo(() => {
    return (
      dashboardData?.tasksByStatus?.map((item: DashboardTasksByStatus) => ({
        name: STATUS_LABELS[item.status] || item.status,
        value: Number(item.count),
        fill: STATUS_COLORS[item.status] || '#ccc',
      })) || []
    );
  }, [dashboardData]);

  const barsKey = `${selectedProjectId}-${tasksPerUser.length}`;
  const pieKey = `${selectedProjectId}-${tasksByStatus.length}`;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Dashboard</Title>
        <NativeSelect
          value={projectId}
          onChange={(e) => setProjectId(e.currentTarget.value)}
          data={[
            { value: '', label: 'Todos os projetos' },
            ...(projects || []).map((p) => ({ value: String(p.id), label: p.name })),
          ]}
          disabled={isLoadingProjects}
        />
      </Group>

      <Grid>
        {[
          { label: 'Total de Tarefas', value: kpis.totalTasks, color: 'gray' },
          { label: 'Concluídas', value: kpis.completedTasks, color: 'teal' },
          { label: 'Pendentes', value: kpis.pendingTasks, color: 'blue' },
          { label: 'Atrasadas', value: kpis.overdueTasks, color: 'red' },
        ].map((kpi) => (
          <Grid.Col key={kpi.label} span={{ base: 12, sm: 6, lg: 3 }}>
            <Card withBorder radius="md" p="md">
              <Text size="sm" c="dimmed">
                {kpi.label}
              </Text>
              <Skeleton visible={isLoadingDashboard} width="50%" mt={8}>
                <Title order={2} mt={4} c={kpi.color}>
                  {kpi.value}
                </Title>
              </Skeleton>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card withBorder radius="md" p="lg" h="100%">
            <Title order={4} mb="lg">
              Tarefas por Colaborador
            </Title>
            <Skeleton visible={isLoadingDashboard} height={300}>
              {!isLoadingDashboard && tasksPerUser.length > 0 ? (
                <ResponsiveContainer key={barsKey} width="100%" height={300}>
                  <BarChart
                    data={tasksPerUser}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="user"
                      fontSize={12}
                      tick={{ fill: 'var(--mantine-color-dimmed)' }}
                    />
                    <YAxis tick={{ fill: 'var(--mantine-color-dimmed)' }} />
                    <Tooltip
                      wrapperStyle={{ outline: 'none' }}
                      contentStyle={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--fg)',
                      }}
                      labelStyle={{ color: 'var(--mantine-color-dimmed)' }}
                      itemStyle={{ color: 'var(--fg)' }}
                    />
                    <Legend wrapperStyle={{ color: 'var(--mantine-color-dimmed)' }} />
                    <Bar dataKey="tasks" fill="var(--mantine-color-violet-6)" name="Tarefas" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                !isLoadingDashboard && (
                  <Text c="dimmed" ta="center">
                    Sem dados
                  </Text>
                )
              )}
            </Skeleton>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card withBorder radius="md" p="lg" h="100%">
            <Title order={4} mb="lg" ta="center">
              Tarefas por Status
            </Title>
            <Skeleton visible={isLoadingDashboard} height={300}>
              {!isLoadingDashboard && tasksByStatus.length > 0 ? (
                <ResponsiveContainer key={pieKey} width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tasksByStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {tasksByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      wrapperStyle={{ outline: 'none' }}
                      contentStyle={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--fg)',
                      }}
                      labelStyle={{ color: 'var(--mantine-color-dimmed)' }}
                      itemStyle={{ color: 'var(--fg)' }}
                    />
                    <Legend wrapperStyle={{ color: 'var(--mantine-color-dimmed)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                !isLoadingDashboard && (
                  <Text c="dimmed" ta="center">
                    Sem dados
                  </Text>
                )
              )}
            </Skeleton>
          </Card>
        </Grid.Col>
      </Grid>

      <Card withBorder radius="md" p="0">
        <Title order={4} m="lg" mb={0}>
          Tarefas Recentes
        </Title>
        <Table
          verticalSpacing="sm"
          striped
          highlightOnHover
          style={{
            ['--table-striped-color']: 'color-mix(in oklab, var(--border) 24%, var(--surface))',
            ['--table-hover-color']: 'color-mix(in oklab, var(--border) 36%, var(--surface))',
            ['--table-border-color']: 'var(--border)',
            background: 'var(--surface)',
            color: 'var(--fg)',
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tarefa</Table.Th>
              <Table.Th>Projeto</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoadingTasks
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <Skeleton height={8} radius="xl" />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton height={8} radius="xl" />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton height={8} radius="xl" width="70%" />
                    </Table.Td>
                  </Table.Tr>
                ))
              : (recentTasks || []).map((task: Task) => (
                  <Table.Tr key={task.id}>
                    <Table.Td>{task.title}</Table.Td>
                    <Table.Td>{task.project?.name || 'N/A'}</Table.Td>
                    <Table.Td>
                      <TaskStatusBadge status={task.status} />
                    </Table.Td>
                  </Table.Tr>
                ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
};

export default DashboardPage;

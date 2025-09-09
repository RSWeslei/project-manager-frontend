// src/modules/app/pages/DashboardPage.tsx
/*
import { JSX, useEffect, useMemo, useState } from 'react';
import { getOverview } from '@/modules/analytics/services/analytics.api';
import { listMyTasks } from '@/modules/tasks/services/tasks.api';
import { listActivity } from '@/modules/activity/services/activity.api';
import { listActiveProjects } from '@/modules/projects/services/projects.api';
import { Project } from '@/modules/projects/types';
import { useToast } from '@/shared/components/ui/Toast';

const toISO = (d: Date): string => d.toISOString().split('T')[0];
const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const DashboardPage = (): JSX.Element => {
  const { push } = useToast();

  const today = useMemo(() => startOfToday(), []);
  const [from, setFrom] = useState<string>(
    toISO(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)),
  );
  const [to, setTo] = useState<string>(toISO(today));
  const [projectId, setProjectId] = useState<number | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);

  const [kpi, setKpi] = useState<{
    open: number;
    overdue: number;
    critical: number;
    activeProjects: number;
  } | null>(null);
  const [loadingKpi, setLoadingKpi] = useState<boolean>(true);

  const [myTasks, setMyTasks] = useState<
    Array<{
      id: number;
      title: string;
      status: string;
      priority: string;
      dueDate?: string | null;
      assigneeName?: string;
    }>
  >([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);

  const [activity, setActivity] = useState<
    Array<{ id: number; message: string; createdAt: string; actor: string }>
  >([]);
  const [loadingActivity, setLoadingActivity] = useState<boolean>(true);

  useEffect(() => {
    let canceled = false;
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        const data = await listActiveProjects();
        if (canceled) return;
        setProjects(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Falha ao buscar projetos';
        push({ title: 'Erro', description: msg, variant: 'error' });
      } finally {
        if (!canceled) setLoadingProjects(false);
      }
    };
    loadProjects();
    return () => {
      canceled = true;
    };
  }, [push]);

  useEffect(() => {
    let canceled = false;
    const fetchAll = async () => {
      try {
        setLoadingKpi(true);
        const overview = await getOverview({ projectId, from, to });
        if (!canceled) {
          setKpi({
            open: overview.kpis.openTasks,
            overdue: overview.kpis.overdueTasks,
            critical: overview.kpis.criticalTasks,
            activeProjects: overview.kpis.activeProjects,
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Falha ao carregar métricas';
        push({ title: 'Erro', description: msg, variant: 'error' });
      } finally {
        if (!canceled) setLoadingKpi(false);
      }

      try {
        setLoadingTasks(true);
        const tasks = await listMyTasks({ from, to });
        if (!canceled) {
          setMyTasks(
            tasks.map((t) => ({
              id: t.id,
              title: t.title,
              status: t.status,
              priority: t.priority,
              dueDate: t.dueDate ?? undefined,
              assigneeName: t.assignee?.name,
            })),
          );
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Falha ao carregar tarefas';
        push({ title: 'Erro', description: msg, variant: 'error' });
      } finally {
        if (!canceled) setLoadingTasks(false);
      }

      try {
        setLoadingActivity(true);
        const feed = await listActivity({ projectId, from, to, limit: 10 });
        if (!canceled) {
          setActivity(
            feed.map((a) => ({
              id: a.id,
              message: a.message,
              createdAt: a.createdAt,
              actor: a.actor.name,
            })),
          );
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Falha ao carregar atividades';
        push({ title: 'Erro', description: msg, variant: 'error' });
      } finally {
        if (!canceled) setLoadingActivity(false);
      }
    };
    fetchAll();
    return () => {
      canceled = true;
    };
  }, [projectId, from, to, push]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-muted text-sm">Projeto</label>
          <select
            value={projectId ?? ''}
            onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)}
            className="input"
            disabled={loadingProjects}
          >
            <option value="">Todos os projetos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-muted text-sm">De</label>
            <input
              type="date"
              className="input"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted text-sm">Até</label>
            <input
              type="date"
              className="input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card p-4">
          <div className="text-muted text-sm">Tarefas abertas</div>
          <div className="mt-1 text-2xl font-semibold">{loadingKpi || !kpi ? '—' : kpi.open}</div>
        </div>
        <div className="card p-4">
          <div className="text-muted text-sm">Atrasadas</div>
          <div className="mt-1 text-2xl font-semibold">
            {loadingKpi || !kpi ? '—' : kpi.overdue}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-muted text-sm">Críticas</div>
          <div className="mt-1 text-2xl font-semibold">
            {loadingKpi || !kpi ? '—' : kpi.critical}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-muted text-sm">Projetos ativos</div>
          <div className="mt-1 text-2xl font-semibold">
            {loadingKpi || !kpi ? '—' : kpi.activeProjects}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Minhas tarefas</h2>
          </div>
          <div className="grid gap-2">
            {loadingTasks ? (
              <div className="text-muted text-sm">carregando...</div>
            ) : myTasks.length === 0 ? (
              <div className="text-muted text-sm">Nenhuma tarefa no intervalo</div>
            ) : (
              myTasks.slice(0, 6).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{t.title}</div>
                    <div className="text-muted truncate text-xs">
                      {t.status} • {t.priority}
                      {t.dueDate ? ` • vence em ${new Date(t.dueDate).toLocaleDateString()}` : ''}
                    </div>
                  </div>
                  <button className="btn btn-outline h-9 px-3 text-sm">Abrir</button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Atividade recente</h2>
          </div>
          <div className="grid gap-2">
            {loadingActivity ? (
              <div className="text-muted text-sm">carregando...</div>
            ) : activity.length === 0 ? (
              <div className="text-muted text-sm">Sem eventos no intervalo</div>
            ) : (
              activity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm">{a.message}</div>
                    <div className="text-muted truncate text-xs">
                      {a.actor} • {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button className="btn btn-outline h-9 px-3 text-sm">Ver</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
*/

import { JSX } from 'react';

const DashboardPage = (): JSX.Element => {
  return <div className="text-muted text-sm">Dashboard desativado temporariamente</div>;
};

export default DashboardPage;

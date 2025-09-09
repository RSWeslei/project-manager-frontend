import { get } from '@/shared/lib/http/client';
import { qs } from '@/shared/lib/http/query';
import { AnalyticsOverview } from '@/modules/analytics/types';

export const getOverview = async (params: {
  projectId?: number | null;
  from: string;
  to: string;
}): Promise<AnalyticsOverview> => {
  const query = qs({ projectId: params.projectId ?? undefined, from: params.from, to: params.to });
  return get<AnalyticsOverview>(`/analytics/overview${query}`);
};

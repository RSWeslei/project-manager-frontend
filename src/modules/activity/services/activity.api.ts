import { get } from '@/shared/lib/http/client';
import { qs } from '@/shared/lib/http/query';
import { ActivityItem } from '@/modules/activity/types';

export const listActivity = async (params: {
  projectId?: number | null;
  from: string;
  to: string;
  limit?: number;
}): Promise<ActivityItem[]> => {
  const query = qs({
    projectId: params.projectId ?? undefined,
    from: params.from,
    to: params.to,
    limit: params.limit ?? 20,
  });
  return get<ActivityItem[]>(`/activity${query}`);
};

import { get } from '@/shared/lib/http/client';
import { qs } from '@/shared/lib/http/query';
import { User } from '@/modules/auth/types';

export const searchUsers = async (q: string): Promise<User[]> => {
  const query = qs({ q, limit: 20 });
  return get<User[]>(`/users${query}`);
};

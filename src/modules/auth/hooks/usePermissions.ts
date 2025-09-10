import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '@/modules/auth/types';

export function usePermissions() {
  const { user } = useAuth();
  const role: UserRole = user?.role ?? 'developer';

  return useMemo(() => {
    const canManage = role === 'admin' || role === 'manager';
    return {
      role,
      canView: true,
      canEdit: canManage,
      canDelete: canManage,
      canCreate: canManage,
    };
  }, [role]);
}

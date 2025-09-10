import { createContext, useContext, useMemo, useState, type JSX, type ReactNode } from 'react';
import { UserRole } from '@/modules/auth/types';

export type AuthUser = { id: number; name: string; email: string; role: UserRole };
type AuthContextValue = { user: AuthUser | null; setUser: (u: AuthUser | null) => void };

export const AuthContext = createContext<AuthContextValue | undefined>(undefined); // exporte o contexto

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
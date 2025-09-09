import { useState } from 'react';
import { useNavigate } from 'react-router';
import { login, LoginPayload, profile } from '@/modules/auth/services/auth.api';
import { paths } from '@/shared/lib/router/paths';
import { LoginData } from '@/modules/auth/types';

type LoginResult = { ok: true; data: LoginData } | { ok: false; message: string };

export const useLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const submit = async (data: LoginPayload): Promise<LoginResult> => {
    setLoading(true);
    try {
      const res = await login(data);
      localStorage.setItem('accessToken', res.tokens.accessToken);
      if (res.tokens.refreshToken) localStorage.setItem('refreshToken', res.tokens.refreshToken);
      const me = await profile();
      localStorage.setItem('me', JSON.stringify(me));
      navigate(paths.dashboard);
      return { ok: true, data: res };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro inesperado';
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading };
};

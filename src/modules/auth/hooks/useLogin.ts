import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { login, LoginPayload, register, RegisterPayload } from '@/modules/auth/services/auth.api';
import { paths } from '@/shared/lib/router/paths';
import { LoginData, User } from '@/modules/auth/types';

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<LoginData, Error, LoginPayload>({
    mutationFn: (data) => login(data),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.tokens.accessToken);
      if (data.tokens.refreshToken) {
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
      }
      queryClient.setQueryData(['me'], data.user);
      navigate(paths.dashboard);
    },
  });
};

export const useRegister = () => {
  return useMutation<User, Error, RegisterPayload>({
    mutationFn: (payload) => register(payload),
  });
};

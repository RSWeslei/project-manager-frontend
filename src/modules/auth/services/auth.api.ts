import { LoginData, User } from '@/modules/auth/types';
import { get, post, postForm } from '@/shared/lib/http/client';

export type LoginPayload = {
  email: string;
  password: string;
  remember?: boolean;
};

export const login = async (payload: LoginPayload): Promise<LoginData> => {
  type BackendLogin = {
    accessToken: string;
    refreshToken?: string;
    user?: User;
  };
  const raw = await post<LoginPayload, BackendLogin | LoginData>('/auth/login', payload);
  if ('tokens' in raw && raw.tokens && raw.user) {
    return raw as LoginData;
  }
  return {
    user: 'user' in raw && raw.user ? raw.user : { id: 0, name: '', email: '', role: 'developer' },
    tokens: {
      accessToken: 'accessToken' in raw ? (raw as BackendLogin).accessToken : '',
      refreshToken: 'refreshToken' in raw ? (raw as BackendLogin).refreshToken : undefined,
    },
  };
};

export const profile = async (): Promise<User> => {
  return get<User>('/auth/profile');
};

export const uploadUserPhoto = async (file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('file', file);
  return postForm<User>('/users/photo', formData);
};
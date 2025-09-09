export type Role = 'admin' | 'manager' | 'developer';

export type User = {
  id: number;
  name: string;
  email: string;
  password?: string | null;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type LoginData = {
  user: User;
  tokens: AuthTokens;
};

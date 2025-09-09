export type UserRole = 'admin' | 'manager' | 'developer';

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type LoginData = {
  user: User;
  tokens: AuthTokens;
};

import { isApiEnvelope } from '@/shared/lib/http/types';
import { refreshAccessToken } from '@/modules/auth/services/auth.api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const baseUrl = import.meta.env.VITE_API_URL;

const parse = async <T>(res: Response): Promise<T> => {
  const text = await res.text();
  const parsed = text ? (JSON.parse(text) as unknown) : ({} as unknown);
  if (!res.ok) {
    if (isApiEnvelope<unknown>(parsed)) {
      const m =
        typeof (parsed as { message: unknown }).message === 'string'
          ? (parsed as { message: string }).message
          : res.statusText;
      throw new Error(m);
    }
    throw new Error(res.statusText);
  }
  if (isApiEnvelope<T>(parsed)) {
    return (parsed as { data: T }).data;
  }
  return parsed as T;
};

export const request = async <
  TBody extends Record<string, unknown> | FormData | undefined,
  TResponse,
>(
  method: HttpMethod,
  path: string,
  body?: TBody,
  isRetry = false,
): Promise<TResponse> => {
  const url = `${baseUrl ?? ''}${path}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let bodyInit: BodyInit | undefined;
  if (body instanceof FormData) {
    bodyInit = body;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    bodyInit = JSON.stringify(body);
  }

  const res = await fetch(url, { method, headers, body: bodyInit });

  if (res.status === 401 && !isRetry) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      return request(method, path, body, true);
    }
  }

  return parse<TResponse>(res);
};

export const get = async <TResponse>(path: string): Promise<TResponse> =>
  request<undefined, TResponse>('GET', path);

export const post = async <TBody extends Record<string, unknown>, TResponse>(
  path: string,
  body: TBody,
): Promise<TResponse> => request<TBody, TResponse>('POST', path, body);

export const postForm = async <TResponse>(path: string, body: FormData): Promise<TResponse> =>
  request<FormData, TResponse>('POST', path, body);

export const patch = async <TBody extends Record<string, unknown>, TResponse>(
  path: string,
  body: TBody,
): Promise<TResponse> => request<TBody, TResponse>('PATCH', path, body);

export const del = async <TResponse>(path: string): Promise<TResponse> =>
  request<undefined, TResponse>('DELETE', path);

export type ApiSuccess<T> = {
  type: 'success';
  message: string;
  data: T;
};

export type ApiError = {
  type: 'error' | 'fail';
  message: string;
  data?: unknown;
};

export const isApiEnvelope = <T>(v: unknown): v is ApiSuccess<T> | ApiError => {
  if (typeof v !== 'object' || v === null) return false;
  const x = v as Record<string, unknown>;
  return typeof x.type === 'string' && typeof x.message === 'string' && 'data' in x;
};

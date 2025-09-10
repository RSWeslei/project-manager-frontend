import { JSX, useEffect, useMemo, useRef, useState } from 'react';

type ApiSuccess<T> = { type: 'success'; message: string; data: T };
type ApiError = { type: 'error'; message: string; data: null };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

type UserProfile = {
  id: number;
  name: string;
  email: string;
  photoUrl?: string | null;
};

const API_URL: string = (import.meta as { env: { VITE_API_URL?: string } }).env.VITE_API_URL ?? '';

const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const fi = parts[0]?.[0] ?? '';
  const li = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (fi + li).toUpperCase();
};

const getToken = (): string | null => {
  const keys: string[] = ['accessToken', 'token', 'auth_token'];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return null;
};

export const UserMenu = (): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const token = useMemo(() => getToken(), []);

  const loadProfile = async (): Promise<void> => {
    if (!token || !API_URL) return;
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = (await res.json()) as ApiResponse<UserProfile>;
    if (json.type === 'success') setProfile(json.data);
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handlePick = (): void => {
    inputRef.current?.click();
  };

  const handleUpload = async (file: File): Promise<void> => {
    if (!token || !API_URL) return;
    const form = new FormData();
    form.append('file', file);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const json = (await res.json()) as ApiResponse<{ url?: string | null }>;
      if (json.type === 'success') {
        await loadProfile();
      }
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc = profile?.photoUrl ?? null;
  const userLabel = profile?.name ?? profile?.email ?? 'Usuário';

  return (
    <div className="relative">
      <button
        className="flex items-center gap-3 rounded-full px-2 py-1 hover:bg-[var(--surface-2)]"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="size-8 overflow-hidden rounded-full bg-[var(--surface-2)]">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={userLabel}
              className="size-full object-cover"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm font-medium text-[var(--fg)]/80">
              {initials(userLabel)}
            </div>
          )}
        </div>
        <div className="hidden text-left sm:block">
          <div className="text-xs leading-4 text-[var(--muted-fg)]">Logado como</div>
          <div className="text-sm font-medium text-[var(--fg)]">{userLabel}</div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-4 text-[var(--fg)]/70"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12 14.25a.75.75 0 0 1-.53-.22l-4.5-4.5a.75.75 0 1 1 1.06-1.06L12 12.19l3.97-3.72a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-.53.22Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <div
          className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
          role="menu"
        >
          <div className="flex items-center gap-3 p-3">
            <div className="size-10 overflow-hidden rounded-full bg-[var(--surface-2)]">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={userLabel}
                  className="size-full object-cover"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-sm font-medium text-[var(--fg)]/80">
                  {initials(userLabel)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[var(--fg)]">{userLabel}</div>
              {profile?.email ? (
                <div className="truncate text-xs text-[var(--muted-fg)]">{profile.email}</div>
              ) : null}
            </div>
          </div>

          <div className="border-t border-[var(--border)]" />

          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--surface-2)] disabled:opacity-60"
            onClick={handlePick}
            disabled={!token || loading}
          >
            {loading ? 'Enviando...' : 'Trocar foto'}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.currentTarget.files?.[0];
              if (f) void handleUpload(f);
              e.currentTarget.value = '';
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

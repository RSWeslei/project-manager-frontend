// src/shared/layouts/AppLayout.tsx
import { JSX, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '@/shared/components/ui/Sidebar';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { useToast } from '@/shared/components/ui/Toast';
import { Menu } from 'lucide-react';
import { profile } from '@/modules/auth/services/auth.api';
import type { User } from '@/modules/auth/types';

type Me = User & {
    photoUrl?: string;
    avatarUrl?: string;
    imageUrl?: string;
    photo?: string;
};

const getUserImage = (u: Me | null): string | null => {
    if (!u) return null;
    return u.photoUrl ?? u.avatarUrl ?? u.imageUrl ?? u.photo ?? null;
};

const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
};

const AppLayout = (): JSX.Element => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [me, setMe] = useState<Me | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const { push } = useToast();

    useEffect(() => {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('me') : null;
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as Me;
                setMe(parsed);
            } catch {
                setMe(null);
            }
        }
    }, []);

    const openFile = () => {
        fileRef.current?.click();
    };

    const doUpload = async (file: File) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
            push({ title: 'Sessão expirada', description: 'Faça login novamente.', variant: 'error' });
            return;
        }
        setUploading(true);
        try {
            const form = new FormData();
            form.append('file', file);
            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/photo`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || 'Falha no upload');
            }
            const fresh = await profile();
            setMe(fresh as Me);
            if (typeof window !== 'undefined') {
                localStorage.setItem('me', JSON.stringify(fresh));
            }
            push({ title: 'Foto atualizada', variant: 'success' });
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Erro inesperado';
            push({ title: 'Erro ao enviar foto', description: message, variant: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const onChangeFile: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
        const f = ev.currentTarget.files && ev.currentTarget.files[0] ? ev.currentTarget.files[0] : null;
        if (f) {
            void doUpload(f);
            ev.currentTarget.value = '';
        }
    };

    const img = getUserImage(me);
    const name = me?.name ?? '';
    const email = me?.email ?? '';

    return (
        <div className="min-h-dvh bg-[var(--bg)] text-[var(--fg)]">
            <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
            <div className="pl-0 transition-[padding] duration-200 lg:pl-72">
                <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur">
                    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                aria-label="Abrir menu"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] shadow-sm lg:hidden"
                                onClick={() => setMobileOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden text-right md:block">
                                <div className="text-sm font-medium">{name}</div>
                                <div className="text-xs text-[var(--muted)]">{email}</div>
                            </div>
                            <button
                                type="button"
                                aria-label="Alterar foto"
                                className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-sm"
                                onClick={openFile}
                                disabled={uploading}
                            >
                                {img ? (
                                    <img src={img} alt={name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-xs font-semibold">{getInitials(name || email)}</span>
                                )}
                                {uploading ? <span className="absolute inset-0 bg-black/20" /> : null}
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={onChangeFile}
                            />
                            <ThemeToggle />
                        </div>
                    </div>
                </header>
                <main className="mx-auto max-w-7xl px-4 py-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;

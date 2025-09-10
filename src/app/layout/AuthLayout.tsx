import { Outlet } from 'react-router';
import { JSX } from 'react';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';

const AuthLayout = (): JSX.Element => {
  return (
    <div className="min-h-dvh">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="hero min-h-dvh">
        <div className="mx-auto grid min-h-dvh max-w-6xl grid-cols-1 gap-8 p-6 lg:grid-cols-2">
          <div className="hidden items-center justify-center lg:flex">
            <div
              className="relative aspect-square w-[28rem] rounded-3xl p-8 shadow-2xl backdrop-blur"
              style={{
                background: 'color-mix(in oklab, var(--surface) 6%, transparent)',
                border: '1px solid color-mix(in oklab, var(--border) 75%, transparent)',
              }}
            >
              <div
                className="absolute inset-0 -z-10 rounded-3xl"
                style={{
                  background:
                    'radial-gradient(60% 60% at 0% 0%, color-mix(in oklab, var(--primary) 15%, transparent) 0%, transparent 60%), radial-gradient(60% 60% at 100% 100%, color-mix(in oklab, var(--primary) 10%, transparent) 0%, transparent 60%)',
                }}
              />
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <span
                  className="text-5xl font-semibold tracking-tight"
                  style={{ color: 'var(--fg)' }}
                >
                  Task Hub
                </span>
                <p className="text-muted max-w-sm">
                  Acompanhe projetos e tarefas em um só lugar.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="mx-auto w-full max-w-md">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

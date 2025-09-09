import { createContext, JSX, ReactNode, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastVariant = 'info' | 'success' | 'error';

export type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type Ctx = {
  push: (t: Omit<ToastItem, 'id'>) => void;
};

const ToastContext = createContext<Ctx | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('ToastProvider ausente');
  }
  return ctx;
};

export const ToastProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = (t: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const next: ToastItem = { id, durationMs: 3800, variant: 'info', ...t };
    setItems((prev) => [next, ...prev]);
    const timeout = setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
      clearTimeout(timeout);
    }, next.durationMs);
  };

  const value = useMemo(() => ({ push }), []);

  return (
    <>
      <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
      {typeof document !== 'undefined'
        ? createPortal(
            <div className="toast-container">
              {items.map((t) => (
                <div key={t.id} className="toast" data-variant={t.variant}>
                  {t.title ? <div className="font-semibold">{t.title}</div> : null}
                  {t.description ? <div className="text-muted text-sm">{t.description}</div> : null}
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
};

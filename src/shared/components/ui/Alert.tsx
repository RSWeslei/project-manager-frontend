import { JSX } from 'react';
import { cn } from '@/shared/lib/cn';

type Props = {
  title?: string;
  description?: string;
  variant?: 'error' | 'info' | 'success';
  className?: string;
};

export const Alert = ({ title, description, variant = 'info', className }: Props): JSX.Element => {
  const map: Record<NonNullable<Props['variant']>, string> = {
    info: 'bg-blue-50 text-blue-900 border-blue-200',
    success: 'bg-green-50 text-green-900 border-green-200',
    error: 'bg-red-50 text-red-900 border-red-200',
  };
  return (
    <div className={cn('w-full rounded-lg border px-4 py-3 text-sm', map[variant], className)}>
      {title ? <div className="font-medium">{title}</div> : null}
      {description ? <div className="text-sm opacity-80">{description}</div> : null}
    </div>
  );
};

import { ButtonHTMLAttributes, JSX } from 'react';
import { cn } from '@/shared/lib/cn';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline';
  loading?: boolean;
};

export const Button = ({
  className,
  variant = 'primary',
  loading,
  children,
  ...props
}: Props): JSX.Element => {
  const base = variant === 'primary' ? 'btn btn-primary' : 'btn btn-outline';
  return (
    <button className={cn(base, className)} disabled={loading || props.disabled} {...props}>
      {loading ? '...' : children}
    </button>
  );
};

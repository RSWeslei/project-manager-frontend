import { LabelHTMLAttributes, JSX } from 'react';
import { cn } from '@/shared/lib/cn';

type Props = LabelHTMLAttributes<HTMLLabelElement>;

export const Label = ({ className, ...props }: Props): JSX.Element => {
  return <label className={cn('text-sm font-medium')} style={{ color: 'var(--fg)' }} {...props} />;
};

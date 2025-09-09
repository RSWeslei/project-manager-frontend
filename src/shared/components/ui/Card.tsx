import { HTMLAttributes, JSX } from 'react';
import { cn } from '@/shared/lib/cn';

type Props = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: Props): JSX.Element => {
  return <div className={cn('card', className)} {...props} />;
};

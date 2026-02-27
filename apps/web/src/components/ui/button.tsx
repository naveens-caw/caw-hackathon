import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

export const Button = ({ className, ...props }: ComponentProps<'button'>) => {
  return (
    <button
      className={cn(
        'rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
};
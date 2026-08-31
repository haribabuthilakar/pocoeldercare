import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#12C395]/15 text-[#0E8164]',
        primary: 'border-transparent bg-[#12C395]/15 text-[#0E8164]',
        secondary: 'border-transparent bg-[#6BAAD0]/15 text-[#407596]',
        accent: 'border-transparent bg-[#FE1D8F]/15 text-[#AD005A]',
        destructive: 'border-transparent bg-rose-100 text-rose-800',
        warning: 'border-transparent bg-amber-100 text-amber-800',
        outline: 'border border-slate-300 text-slate-700 bg-white',
        dot: 'border-transparent bg-slate-100 text-slate-700 pl-1.5'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dotColor?: string;
}

export function Badge({ className, variant, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dotColor && (
        <span
          className={cn('mr-1.5 h-2 w-2 rounded-full', dotColor)}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

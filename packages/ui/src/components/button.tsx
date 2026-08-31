import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-[#12C395] text-white hover:bg-[#0FA37C] shadow-sm',
        primary: 'bg-[#12C395] text-white hover:bg-[#0FA37C] shadow-sm',
        accent: 'bg-[#FE1D8F] text-white hover:bg-[#D90B75] shadow-sm',
        secondary: 'bg-[#6BAAD0] text-white hover:bg-[#5290B5] shadow-sm',
        destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
        outline: 'border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800',
        ghost: 'hover:bg-slate-100 text-slate-700 hover:text-slate-900',
        link: 'text-[#12C395] underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-11 px-5 py-2 text-base',
        sm: 'h-9 rounded-lg px-3 text-sm',
        lg: 'h-14 rounded-2xl px-8 text-lg font-bold',
        senior: 'h-14 min-h-[48px] px-8 text-lg font-bold rounded-2xl',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

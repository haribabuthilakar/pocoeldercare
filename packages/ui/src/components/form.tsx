import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, error, required, hint, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-1.5 w-full', className)} {...props}>
        {label && (
          <label className="block text-sm font-semibold text-slate-800">
            {label}
            {required && <span className="text-[#FE1D8F] ml-1">*</span>}
          </label>
        )}
        {children}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && (
          <div className="flex items-center space-x-1.5 text-xs font-medium text-[#FE1D8F] animate-shake-error">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, isError, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-base text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          isError && 'border-[#FE1D8F] focus-visible:ring-[#FE1D8F]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

export interface StepItem {
  id: string;
  title: string;
  description?: string;
}

export interface WizardStepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepItem[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
}

export function WizardStepper({
  steps,
  currentStepIndex,
  onStepClick,
  className,
  ...props
}: WizardStepperProps) {
  return (
    <div className={cn('w-full py-4', className)} {...props}>
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <li
              key={step.id}
              className={cn(
                'relative flex flex-1 items-center',
                idx !== steps.length - 1 &&
                  'after:content-[\'\'] after:w-full after:h-1 after:border-b-2 after:border-slate-200 after:inline-block after:mx-2',
                idx !== steps.length - 1 && isCompleted && 'after:border-[#12C395]'
              )}
            >
              <div
                onClick={() => onStepClick?.(idx)}
                className={cn(
                  'flex items-center space-x-2 shrink-0 select-none',
                  onStepClick && 'cursor-pointer'
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors',
                    isCompleted && 'bg-[#12C395] text-white',
                    isCurrent && 'border-2 border-[#12C395] bg-emerald-50 text-[#0E8164] ring-2 ring-[#12C395]/30',
                    isPending && 'border-2 border-slate-200 bg-white text-slate-400'
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : idx + 1}
                </div>
                <div className="hidden sm:block text-left">
                  <div
                    className={cn(
                      'text-xs font-bold leading-none',
                      isCurrent && 'text-[#0E8164]',
                      isCompleted && 'text-slate-900',
                      isPending && 'text-slate-400'
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-[10px] text-slate-400 mt-0.5">{step.description}</div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider transition',
  {
    variants: {
      variant: {
        default: 'border-electric/40 bg-electric/10 text-electric',
        challenger: 'border-challenger/40 bg-challenger/10 text-challenger',
        muted: 'border-white/10 bg-white/5 text-graphite-300',
        destructive: 'border-destructive/40 bg-destructive/10 text-destructive',
        success: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

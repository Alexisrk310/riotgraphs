import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: 'up' | 'down' | 'neutral';
  accent?: 'electric' | 'challenger' | 'default';
  className?: string;
}

export function StatCard({ label, value, hint, trend, accent = 'default', className }: StatCardProps) {
  const trendColor =
    trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-graphite-300';
  const valueColor =
    accent === 'electric'
      ? 'text-electric'
      : accent === 'challenger'
        ? 'text-challenger'
        : 'text-white';
  return (
    <div className={cn('glass glass-hover flex flex-col gap-1 rounded-xl p-5', className)}>
      <span className="font-mono text-[10px] uppercase tracking-widest text-graphite-400">
        {label}
      </span>
      <span className={cn('font-display text-3xl font-bold num-mono', valueColor)}>{value}</span>
      {hint && <span className={cn('text-xs num-mono', trendColor)}>{hint}</span>}
    </div>
  );
}

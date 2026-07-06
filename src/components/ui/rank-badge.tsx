import { cn } from '@/lib/utils';

const TIER_STYLES: Record<string, string> = {
  IRON: 'from-stone-500 to-stone-700 text-stone-100',
  BRONZE: 'from-amber-700 to-orange-900 text-amber-100',
  SILVER: 'from-slate-300 to-slate-500 text-slate-900',
  GOLD: 'from-yellow-400 to-amber-600 text-yellow-950',
  PLATINUM: 'from-cyan-300 to-teal-500 text-cyan-950',
  EMERALD: 'from-emerald-400 to-emerald-600 text-emerald-950',
  DIAMOND: 'from-sky-300 to-indigo-500 text-sky-950',
  MASTER: 'from-fuchsia-400 to-purple-600 text-white',
  GRANDMASTER: 'from-rose-400 to-red-600 text-white',
  CHALLENGER: 'from-challenger-200 via-challenger to-challenger-600 text-obsidian-950',
  UNRANKED: 'from-graphite-500 to-graphite-400 text-obsidian-950',
};

export function RankBadge({
  tier,
  rank,
  lp,
  size = 'md',
}: {
  tier?: string | null;
  rank?: string | null;
  lp?: number | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const T = (tier ?? 'UNRANKED').toUpperCase();
  const styles = TIER_STYLES[T] ?? TIER_STYLES.UNRANKED;
  const sizeStyles =
    size === 'lg' ? 'px-4 py-1.5 text-sm' : size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-md bg-gradient-to-br font-mono font-bold uppercase tracking-wider shadow-inner',
        styles,
        sizeStyles,
      )}
    >
      <span>{T}</span>
      {rank && <span className="opacity-80">{rank}</span>}
      {typeof lp === 'number' && <span className="opacity-70">{lp} LP</span>}
    </div>
  );
}

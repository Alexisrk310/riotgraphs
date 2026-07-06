'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Loader2, User } from 'lucide-react';

const REGIONS = [
  ['euw1', 'EUW'],
  ['eun1', 'EUNE'],
  ['na1', 'NA'],
  ['kr', 'KR'],
  ['br1', 'BR'],
  ['jp1', 'JP'],
  ['la1', 'LAN'],
  ['la2', 'LAS'],
  ['oc1', 'OCE'],
  ['tr1', 'TR'],
  ['ru', 'RU'],
];

export function PlayerSearch({ onSelect }: { onSelect?: () => void }) {
  const router = useRouter();
  const [region, setRegion] = useState('euw1');
  const [q, setQ] = useState('');
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const [name, tag] = q.split('#');
    if (!name || !tag) return;
    start(() => {
      router.push(`/lol/${region}/${encodeURIComponent(name.trim())}-${encodeURIComponent(tag.trim())}`);
      onSelect?.();
    });
  }

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-2xl items-center gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-obsidian-800/80 px-3">
        <User className="h-4 w-4 text-graphite-300" />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="cursor-pointer appearance-none bg-transparent py-2.5 pr-2 font-mono text-sm text-electric focus:outline-none"
        >
          {REGIONS.map(([v, l]) => (
            <option key={v} value={v} className="bg-obsidian-900">
              {l}
            </option>
          ))}
        </select>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Faker#KR1"
        className="flex-1 rounded-lg border border-white/10 bg-obsidian-800/80 px-4 py-2.5 text-sm placeholder:text-graphite-400 focus:border-electric/50 focus:outline-none focus:ring-2 focus:ring-electric/20"
      />
      <button
        type="submit"
        disabled={pending || !q.includes('#')}
        className="flex items-center gap-2 rounded-lg bg-gradient-electric px-5 py-2.5 text-sm font-semibold text-obsidian-950 shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Search
      </button>
    </form>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Menu } from 'lucide-react';
import { useState } from 'react';
import { PlayerSearch } from './player-search';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/lol', label: 'League' },
  { href: '/valorant', label: 'Valorant' },
  { href: '/tft', label: 'TFT' },
  { href: '/lor', label: 'LoR' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/tier-list', label: 'Tier List' },
  { href: '/compare', label: 'Compare' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-obsidian-950/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-electric shadow-glow"
          >
            <span className="font-display text-sm font-bold text-obsidian-950">R</span>
          </motion.div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-base font-bold tracking-tight">
              Riot<span className="text-gradient-electric">Graphs</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-graphite-300">
              competitive intelligence
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'text-electric'
                    : 'text-graphite-300 hover:text-white',
                )}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-md bg-electric/10 ring-1 ring-electric/30"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setSearchOpen((s) => !s)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-graphite-300 transition hover:border-electric/40 hover:text-white"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search summoner…</span>
            <kbd className="hidden rounded bg-obsidian-800 px-1.5 py-0.5 font-mono text-[10px] sm:inline">⌘K</kbd>
          </button>
          <Link
            href="/pricing"
            className="hidden rounded-lg bg-gradient-challenger px-4 py-1.5 text-sm font-semibold text-obsidian-950 shadow-glow-gold transition hover:brightness-110 sm:inline-block"
          >
            Go Premium
          </Link>
          <button className="rounded-lg border border-white/10 p-2 md:hidden">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-white/5 bg-obsidian-900/95 px-6 py-4">
          <PlayerSearch onSelect={() => setSearchOpen(false)} />
        </div>
      )}
    </header>
  );
}

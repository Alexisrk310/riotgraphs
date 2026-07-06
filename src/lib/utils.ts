import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, opts: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1, ...opts }).format(n);
}

export function formatPercent(n: number, digits = 1) {
  return `${(n * 100).toFixed(digits)}%`;
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function timeAgo(date: Date | string | number) {
  const d = typeof date === 'object' ? date : new Date(date);
  const diff = Date.now() - d.getTime();
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60_000, 'minute'],
    [3_600_000, 'hour'],
    [86_400_000, 'day'],
    [2_592_000_000, 'month'],
    [31_536_000_000, 'year'],
  ];
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (diff < 60_000) return 'just now';
  for (let i = units.length - 1; i >= 0; i--) {
    const [ms, unit] = units[i];
    if (diff >= ms) return rtf.format(-Math.floor(diff / ms), unit);
  }
  return rtf.format(-Math.floor(diff / 60_000), 'minute');
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function safeJson<T>(input: string, fallback: T): T {
  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
}

export async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

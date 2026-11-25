import type { Experience } from '@/types';
import { dateRange } from '@/lib/dates';

/**
 * A description written as separate lines in /admin becomes one bullet per line.
 * A leading "•", "-" or "*" typed by hand is dropped, so there is never a double bullet.
 */
export function descriptionLines(detail: string): string[] {
  return detail
    .split('\n')
    .map((line) => line.replace(/^\s*[•\-*]\s*/, '').trim())
    .filter(Boolean);
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "Jun 2025" → a number that sorts by time. Read by hand: browsers parse such dates differently. */
function startKey(e: Experience): number {
  const text = (e.startDate ?? '').trim();
  const m = /^([A-Za-z]{3})[A-Za-z]*\.?\s+(\d{4})$/.exec(text);
  if (m) return Number(m[2]) * 12 + Math.max(0, MONTHS.indexOf(m[1].toLowerCase()));
  const year = /(\d{4})/.exec(text);
  return year ? Number(year[1]) * 12 : 0;
}

/**
 * Entries with the same employer (the Work & Travel seasons) share one line: the
 * oldest entry's role and place, and every season's dates side by side, oldest first.
 * Each season stays its own entry in /admin, so every date can still be edited there.
 */
export function mergeByCompany(entries: Experience[], present: string): { first: Experience; dates: string }[] {
  const groups = new Map<string, Experience[]>();
  for (const e of entries) groups.set(e.company, [...(groups.get(e.company) ?? []), e]);
  return [...groups.values()].map((group) => {
    const seasons = [...group].sort((a, b) => startKey(a) - startKey(b));
    return { first: seasons[0], dates: seasons.map((e) => dateRange(e, present)).join(' · ') };
  });
}

/**
 * "Mar 2025 – Apr 2025", "Oct 2026 – Present", or a single month when the
 * entry starts and ends in the same month ("Nov 2026", not "Nov 2026 – Nov 2026").
 */
export function dateRange(
  e: { startDate?: string; endDate?: string; current?: boolean },
  presentLabel: string,
): string {
  const start = (e.startDate ?? '').trim();
  if (e.current) return start ? `${start} – ${presentLabel}` : presentLabel;
  const end = (e.endDate ?? '').trim();
  if (!end || end === start) return start;
  return start ? `${start} – ${end}` : end;
}
